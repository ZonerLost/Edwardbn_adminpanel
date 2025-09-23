import React from "react";

function fmtDateTime(v) {
  try {
    const d = typeof v?.toDate === "function" ? v.toDate() : new Date(v);
    if (Number.isNaN(d.getTime())) return "-";
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return "-";
  }
}

function Media({ label, url }) {
  if (!url) return null;
  const isImage = /\.(png|jpe?g|gif|webp|bmp|svg)(\?.*)?$/i.test(url);
  return (
    <div>
      <strong>{label}:</strong>
      <div className="mt-2">
        {isImage ? (
          <img src={url} alt={label} className="rounded-md w-full max-h-48 object-cover" loading="lazy" />
        ) : (
          <a href={url} target="_blank" rel="noreferrer" className="text-blue-600 underline break-all">
            Open {label}
          </a>
        )}
      </div>
    </div>
  );
}

export default function DetailsView({ contract, maskedCard }) {
  return (
    <>
      <div className="grid grid-cols-1 gap-3">
        <p>
          <strong>Contract ID:</strong> {contract?.contractId || contract?.id || "-"}
        </p>
        <p>
          <strong>Name:</strong> {(contract?.firstName || "-") + " " + (contract?.lastName || "")}
        </p>
        <p>
          <strong>Email:</strong> {contract?.email || "-"}
        </p>
        <p>
          <strong>Phone:</strong> {contract?.phoneNumber || "-"}
        </p>
        <p>
          <strong>Status:</strong> {contract?.status || "-"}
        </p>
        <p>
          <strong>Due Date:</strong> {contract?.date || "-"}
        </p>
        <p>
          <strong>Created At:</strong> {fmtDateTime(contract?.createdAt)}
        </p>
        <p>
          <strong>Card:</strong> {maskedCard}
        </p>
      </div>
      <Media label="Driver Photo"   url={contract?.driverPhotoUrl} />
      <Media label="License Photo"  url={contract?.licensePhotoUrl} />
      <Media label="Signature"      url={contract?.signatureUrl} />
    </>
  );
}
