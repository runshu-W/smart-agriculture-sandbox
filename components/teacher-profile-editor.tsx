"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Pencil, X } from "lucide-react";

export function TeacherProfileEditor({ name }: { name: string }) {
  const [savedName, setSavedName] = useState(name);
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null); const router = useRouter();
  const [value, setValue] = useState(name); const [pending, setPending] = useState(false); const [error, setError] = useState("");
  useEffect(() => { if (open) dialog.current?.showModal(); }, [open]);
  return <><button type="button" className="profile-edit-trigger" aria-label="修改教师昵称" title="修改昵称" onClick={() => { setValue(savedName); setError(""); setOpen(true); }}><b>{savedName}</b><Pencil size={14} /></button>
    {open && createPortal(<dialog onClose={() => setOpen(false)} ref={dialog} className="profile-edit-dialog" aria-label="修改教师昵称"><form onSubmit={async e => {
      e.preventDefault(); setPending(true); setError("");
      try { const response = await fetch("/api/teacher/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ displayName: value }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error); setSavedName(data.displayName); router.refresh(); dialog.current?.close(); }
      catch (error) { setError(error instanceof Error ? error.message : "保存失败"); } finally { setPending(false); }
    }}><header><h2>修改昵称</h2><button type="button" aria-label="关闭" onClick={() => dialog.current?.close()} disabled={pending}><X /></button></header><label>教师昵称<input value={value} onChange={e => setValue(e.target.value)} required maxLength={30} autoFocus /></label><p>学生端和课堂中将显示这个名字，登录账号保持不变。</p>{error && <p role="alert">{error}</p>}<button className="primary-button" disabled={pending}>{pending ? "正在保存…" : "保存昵称"}</button></form></dialog>, document.body)}</>;
}
