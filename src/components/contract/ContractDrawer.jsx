import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { createContract, updateContract } from "../../features/db/contract/api";
import { uploadContractImages } from "../../lib/storage";

/* ui */
import Section from "./ui/Section";
import Spinner from "./ui/Spinner";
import TextField from "./ui/TextField";
import SelectField from "./ui/SelectField";
import Uploader from "./ui/Uploader";
import Progress from "./ui/Progress";
import DetailsView from "./ui/DetailsView";
import DrawerSkeleton from "./ui/DrawerSkeleton";

/* ---------------------------- Config & Helpers ---------------------------- */
const MAX_IMAGE_MB = 5;
const isImageFile = (file) => file?.type?.startsWith("image/");
const onlyDigits = (s) => String(s || "").replace(/\D+/g, "");
const STORE_FULL_CARD_NUMBER = false; // safer default: false

function formatCardInput(value) {
  return onlyDigits(value)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}
function maskCardForDisplay(value) {
  const s = onlyDigits(value);
  if (s.length < 4) return s;
  const last4 = s.slice(-4);
  const masked = "•".repeat(Math.max(0, s.length - 4)) + last4;
  return masked.replace(/(.{4})/g, "$1 ").trim();
}

/* --------------------------------- UI --------------------------------- */
export default function ContractDrawer({
  isOpen,
  onClose,
  contract,
  startInEdit = false,
  onSaved,
  loading = false, // <- pass true to show skeleton while you fetch contract
}) {
  const isCreate = !contract;

  // --- All hooks at top (no conditionals) ---
  const [editing, setEditing] = useState(isCreate || startInEdit);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  // upload files + previews
  const [driverFile, setDriverFile] = useState(null);
  const [licenseFile, setLicenseFile] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);

  const [driverPreview, setDriverPreview] = useState("");
  const [licensePreview, setLicensePreview] = useState("");
  const [signaturePreview, setSignaturePreview] = useState("");

  // upload progress
  const [driverPct, setDriverPct] = useState(0);
  const [licensePct, setLicensePct] = useState(0);
  const [signaturePct, setSignaturePct] = useState(0);

  // form state
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    status: "",
    date: "",
    cardNumber: "", // raw user input
    driverPhotoUrl: "",
    licensePhotoUrl: "",
    signatureUrl: "",
  });

  // validation state
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setEditing(isCreate || startInEdit);
  }, [isCreate, startInEdit]);

  useEffect(() => {
    if (!isOpen) return;

    if (contract) {
      setForm({
        firstName: contract.firstName || "",
        lastName: contract.lastName || "",
        email: contract.email || "",
        phoneNumber: contract.phoneNumber || "",
        status: contract.status || "",
        date: contract.date || "",
        cardNumber: "",
        driverPhotoUrl: contract.driverPhotoUrl || "",
        licensePhotoUrl: contract.licensePhotoUrl || "",
        signatureUrl: contract.signatureUrl || "",
      });
      setDriverFile(null);
      setLicenseFile(null);
      setSignatureFile(null);
      setDriverPreview(contract.driverPhotoUrl || "");
      setLicensePreview(contract.licensePhotoUrl || "");
      setSignaturePreview(contract.signatureUrl || "");
    } else {
      resetForm();
    }
    setDirty(false);
    setErrors({});
    setDriverPct(0);
    setLicensePct(0);
    setSignaturePct(0);
  }, [isOpen, contract]);

  function resetForm() {
    setForm({
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      status: "",
      date: "",
      cardNumber: "",
      driverPhotoUrl: "",
      licensePhotoUrl: "",
      signatureUrl: "",
    });
    setDriverFile(null);
    setLicenseFile(null);
    setSignatureFile(null);
    setDriverPreview("");
    setLicensePreview("");
    setSignaturePreview("");
  }

  const onChange = (e) => {
    const { name, value } = e.target;
    setDirty(true);
    if (name === "cardNumber") {
      setForm((f) => ({ ...f, [name]: formatCardInput(value) }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) {
      if (editing && dirty && !confirm("Discard unsaved changes?")) return;
      onClose();
    }
  };

  const onPick = (setterFile, setterPreview) => (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!isImageFile(file)) return toast.error("Please choose an image file.");
    if (file.size > MAX_IMAGE_MB * 1024 * 1024)
      return toast.error(`Image must be under ${MAX_IMAGE_MB} MB.`);
    setDirty(true);
    setterFile(file);
    setterPreview(URL.createObjectURL(file));
  };

  const clearPicked = (setterFile, setterPreview, key) => () => {
    setDirty(true);
    setterFile(null);
    setterPreview("");
    setForm((f) => ({ ...f, [key]: "" }));
  };

  function validate() {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "First name is required.";
    if (!form.lastName.trim()) e.lastName = "Last name is required.";
    if (!form.status) e.status = "Status is required.";

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    try {
      if (!validate()) {
        toast.error("Please fix the highlighted fields.");
        return;
      }
      setSaving(true);

      const rawCard = onlyDigits(form.cardNumber);
      const cardFields = rawCard
        ? STORE_FULL_CARD_NUMBER
          ? { cardNumber: rawCard, cardLast4: rawCard.slice(-4) }
          : { cardLast4: rawCard.slice(-4) }
        : {};

      const stripUndefined = (obj) =>
        Object.fromEntries(
          Object.entries(obj).filter(([, v]) => v !== undefined)
        );

      const basePayload = stripUndefined({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phoneNumber: form.phoneNumber.trim(),
        status: form.status,
        date: form.date,
        ...cardFields,
      });

      const created = isCreate ? await createContract(basePayload) : contract;
      const contractId = created.id;

      const { driverUrl, licenseUrl, signatureUrl } =
        await uploadContractImages(
          contractId,
          {
            driver: driverFile || null,
            license: licenseFile || null,
            signature: signatureFile || null,
          },
          {
            driver: setDriverPct,
            license: setLicensePct,
            signature: setSignaturePct,
          }
        );

      const patch = {
        ...basePayload,
        ...(driverUrl
          ? { driverPhotoUrl: driverUrl }
          : form.driverPhotoUrl === ""
          ? { driverPhotoUrl: "" }
          : {}),
        ...(licenseUrl
          ? { licensePhotoUrl: licenseUrl }
          : form.licensePhotoUrl === ""
          ? { licensePhotoUrl: "" }
          : {}),
        ...(signatureUrl
          ? { signatureUrl: signatureUrl }
          : form.signatureUrl === ""
          ? { signatureUrl: "" }
          : {}),
      };

      const updated = await updateContract(contractId, patch);
      toast.success(isCreate ? "Contract created" : "Contract updated");
      setEditing(false);
      setDirty(false);
      onSaved?.(updated);
    } catch (e) {
      console.error(e);
      toast.error(e?.message || "Failed to save contract");
    } finally {
      setSaving(false);
    }
  }

  const displayCardMasked = useMemo(() => {
    if (form.cardNumber) return maskCardForDisplay(form.cardNumber);
    const last4 =
      (contract?.cardLast4 && String(contract.cardLast4)) ||
      String(contract?.cardNumber || "")
        .replace(/\D+/g, "")
        .slice(-4);
    return last4 ? `•••• •••• •••• ${last4}` : "-";
  }, [form.cardNumber, contract?.cardLast4, contract?.cardNumber]);

  // --- early return comes AFTER hooks ---
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex" onMouseDown={handleBackdrop}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" aria-hidden="true" />

      {/* Drawer */}
      <div
        className="relative ml-auto h-full w-full sm:w-[620px] bg-white shadow-xl overflow-y-auto
                   motion-safe:transition-transform motion-safe:duration-300"
        style={{ transform: "translateX(0)" }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="sticky top-0 bg-white/80 backdrop-blur z-10 border-b">
          <div className="flex justify-between items-center p-4">
            <h2 className="text-lg font-semibold">
              {isCreate ? "New Contract" : "Contract Details"}
            </h2>

            <div className="flex items-center gap-2">
              {!editing ? (
                <button
                  className="px-3 py-1 rounded bg-neutral-900 text-white text-sm"
                  onClick={() => setEditing(true)}
                >
                  Edit
                </button>
              ) : (
                <>
                  <button
                    className="px-3 py-1 rounded bg-blue-600 text-white text-sm disabled:opacity-60 inline-flex items-center gap-2"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving && <Spinner />}
                    {saving ? "Saving…" : isCreate ? "Create" : "Save"}
                  </button>
                  <button
                    className="px-3 py-1 rounded border text-sm"
                    onClick={() => {
                      if (dirty && !confirm("Discard unsaved changes?")) return;
                      setEditing(false);
                      setErrors({});
                    }}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                </>
              )}
              <button
                className="text-gray-600 hover:text-black"
                onClick={() => {
                  if (editing && dirty && !confirm("Discard unsaved changes?"))
                    return;
                  onClose();
                }}
                disabled={saving}
                aria-label="Close"
                title="Close"
              >
                ✕
              </button>
            </div>
          </div>
        </header>

        {/* Body */}
        <div className="p-6 space-y-6">
          {loading ? (
            <DrawerSkeleton />
          ) : editing ? (
            <form
              className="grid grid-cols-1 gap-4"
              onSubmit={(e) => e.preventDefault()}
            >
              <Section title="Contact">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <TextField
                    label="First name"
                    name="firstName"
                    value={form.firstName}
                    onChange={onChange}
                    placeholder="e.g. John"
                    error={errors.firstName}
                  />
                  <TextField
                    label="Last name"
                    name="lastName"
                    value={form.lastName}
                    onChange={onChange}
                    placeholder="e.g. Doe"
                    error={errors.lastName}
                  />
                </div>

                <TextField
                  label="Email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  placeholder="john@acme.com"
                />
                <TextField
                  label="Phone"
                  name="phoneNumber"
                  value={form.phoneNumber}
                  onChange={onChange}
                  placeholder="+92 300 1234567"
                />
              </Section>

              <Section title="Contract">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <SelectField
                    label="Status"
                    name="status"
                    value={form.status}
                    onChange={onChange}
                    options={["active", "pending", "paused", "closed"]}
                    placeholder="Select status"
                    error={errors.status}
                  />
                  <TextField
                    label="Due date"
                    name="date"
                    value={form.date}
                    onChange={onChange}
                    placeholder="16/9/2025"
                  />
                </div>
              </Section>

              <Section
                title="Payment"
                subtitle={
                  STORE_FULL_CARD_NUMBER
                    ? "Full card will be stored (not recommended)."
                    : "Only the last 4 digits will be stored for safety."
                }
              >
                <TextField
                  label="Card number"
                  name="cardNumber"
                  value={form.cardNumber}
                  onChange={onChange}
                  placeholder="1234 5678 9012 3456"
                  error={errors.cardNumber}
                />
                {!!form.cardNumber && (
                  <div className="text-xs text-gray-500">
                    Preview: {maskCardForDisplay(form.cardNumber)}
                  </div>
                )}
              </Section>

              <Section title="Files">
                <Uploader
                  label="Driver Photo"
                  previewUrl={driverPreview || form.driverPhotoUrl}
                  onPick={onPick(setDriverFile, setDriverPreview)}
                  onClear={clearPicked(
                    setDriverFile,
                    setDriverPreview,
                    "driverPhotoUrl"
                  )}
                  maxMB={MAX_IMAGE_MB}
                />
                {!!driverFile && <Progress label="Driver" value={driverPct} />}

                <Uploader
                  label="License Photo"
                  previewUrl={licensePreview || form.licensePhotoUrl}
                  onPick={onPick(setLicenseFile, setLicensePreview)}
                  onClear={clearPicked(
                    setLicenseFile,
                    setLicensePreview,
                    "licensePhotoUrl"
                  )}
                  maxMB={MAX_IMAGE_MB}
                />
                {!!licenseFile && (
                  <Progress label="License" value={licensePct} />
                )}

                <Uploader
                  label="Signature Image"
                  previewUrl={signaturePreview || form.signatureUrl}
                  onPick={onPick(setSignatureFile, setSignaturePreview)}
                  onClear={clearPicked(
                    setSignatureFile,
                    setSignaturePreview,
                    "signatureUrl"
                  )}
                  maxMB={MAX_IMAGE_MB}
                />
                {!!signatureFile && (
                  <Progress label="Signature" value={signaturePct} />
                )}
              </Section>
            </form>
          ) : (
            <DetailsView contract={contract} maskedCard={displayCardMasked} />
          )}
        </div>
      </div>
    </div>
  );
}
