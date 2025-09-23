// import React from "react";
// import TextInput from "./fields/TextInput";
// import SelectInput from "./fields/SelectInput";
// import CheckboxList from "./fields/CheckboxList";
// import { ALL_PERMS, ROLES, STATUSES } from "../../utils/validation";

// export default function UserForm({ form, setForm, creating }) {
//   const permsDisabled = form.role !== "admin";

//   const onChange = (e) => {
//     const { name, value } = e.target;
//     setForm((f) => ({ ...f, [name]: value }));
//   };

//   const togglePerm = (perm) => {
//     setForm((f) => {
//       const has = f.permissions.includes(perm);
//       return {
//         ...f,
//         permissions: has
//           ? f.permissions.filter((x) => x !== perm)
//           : [...f.permissions, perm],
//       };
//     });
//   };

//   return (
//     <form
//       className="grid grid-cols-1 gap-4"
//       onSubmit={(e) => e.preventDefault()}
//     >
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//         <TextInput
//           label="Full name"
//           name="displayName"
//           value={form.displayName}
//           onChange={onChange}
//           placeholder="e.g. Jane Doe"
//         />
//         <TextInput
//           label="Email"
//           type="email"
//           name="email"
//           value={form.email}
//           onChange={onChange}
//           placeholder="jane@example.com"
//         />
//       </div>

//       {creating && (
//         <TextInput
//           label="Password"
//           type="password"
//           name="password"
//           value={form.password}
//           onChange={onChange}
//           placeholder="*******"
//         />
//       )}

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//         <TextInput
//           label="Phone"
//           name="phoneNumber"
//           value={form.phoneNumber}
//           onChange={onChange}
//           placeholder="+92 300 1234567"
//         />
//         <div />
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//         <SelectInput
//           label="Role"
//           name="role"
//           value={form.role}
//           onChange={(e) => {
//             const next = e.target.value;
//             setForm((f) => ({
//               ...f,
//               role: next,
//               permissions: next === "admin" ? f.permissions : [],
//             }));
//           }}
//           options={ROLES}
//           placeholder="Select role"
//         />

//         <SelectInput
//           label="Status"
//           name="status"
//           value={form.status}
//           onChange={onChange}
//           options={STATUSES}
//           placeholder="Select status"
//         />
//       </div>

//       <fieldset className="border rounded p-3">
//         <legend className="px-1 text-sm font-medium">
//           Permissions (admin only)
//         </legend>
//         <CheckboxList
//           items={ALL_PERMS}
//           values={form.permissions}
//           onToggle={togglePerm}
//           disabled={permsDisabled}
//         />
//       </fieldset>
//     </form>
//   );
// }



import React from "react";
import TextInput from "./fields/TextInput";
import SelectInput from "./fields/SelectInput";
import CheckboxList from "./fields/CheckboxList";
import { ALL_PERMS, ROLES, STATUSES } from "../../utils/validation";

export default function UserForm({ form, setForm, creating, isSelf = false }) {
  const permsDisabled = form.role !== "admin";

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const togglePerm = (perm) => {
    setForm((f) => {
      const has = f.permissions.includes(perm);
      return {
        ...f,
        permissions: has ? f.permissions.filter((x) => x !== perm) : [...f.permissions, perm],
      };
    });
  };

  return (
    <form className="grid grid-cols-1 gap-4" onSubmit={(e) => e.preventDefault()}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <TextInput
          label="Full name"
          name="displayName"
          value={form.displayName}
          onChange={onChange}
          placeholder="e.g. Jane Doe"
        />

        {/* Email:
            - Create: editable
            - Edit self: editable
            - Edit other: disabled (Auth email cannot be changed client-side)
        */}
        <TextInput
          label="Email"
          type="email"
          name="email"
          value={form.email}
          onChange={onChange}
          placeholder="jane@example.com"
          disabled={!creating && !isSelf}
          hint={!creating && !isSelf ? "Only the user can change their login email." : undefined}
        />
      </div>

      {/* Create-only password */}
      {creating && (
        <TextInput
          label="Password"
          type="password"
          name="password"
          value={form.password}
          onChange={onChange}
          placeholder="*******"
        />
      )}

      {/* Edit self: show current + new password fields */}
      {!creating && isSelf && (
        <>
          <TextInput
            label="Current password (for verification)"
            type="password"
            name="currentPassword"
            value={form.currentPassword}
            onChange={onChange}
            placeholder="Your current password"
          />
          <TextInput
            label="New password"
            type="password"
            name="newPassword"
            value={form.newPassword}
            onChange={onChange}
            placeholder="New password"
          />
        </>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <TextInput
          label="Phone"
          name="phoneNumber"
          value={form.phoneNumber}
          onChange={onChange}
          placeholder="+92 300 1234567"
        />
        <div />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <SelectInput
          label="Role"
          name="role"
          value={form.role}
          onChange={(e) => {
            const next = e.target.value;
            setForm((f) => ({
              ...f,
              role: next,
              permissions: next === "admin" ? f.permissions : [],
            }));
          }}
          options={ROLES}
          placeholder="Select role"
        />

        <SelectInput
          label="Status"
          name="status"
          value={form.status}
          onChange={onChange}
          options={STATUSES}
          placeholder="Select status"
        />
      </div>

      <fieldset className="border rounded p-3">
        <legend className="px-1 text-sm font-medium">Permissions (admin only)</legend>
        <CheckboxList
          items={ALL_PERMS}
          values={form.permissions}
          onToggle={togglePerm}
          disabled={permsDisabled}
        />
      </fieldset>
    </form>
  );
}
