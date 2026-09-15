"use client";
import { useState } from "react";
export type StudentCredential = { displayName: string; studentNo: string; username: string; password: string };
export function StudentCredentials({ items }: { items: StudentCredential[] }) {
  const [error, setError] = useState(""); const [pending, setPending] = useState(false);
  if (!items.length) return null;
  async function download() {
    setPending(true); setError("");
    try {
      const writeXlsxFile = (await import("write-excel-file/browser")).default;
      const rows=[["学号","学生姓名","登录账号","初始密码"],...items.map(i=>[i.studentNo,i.displayName,i.username,i.password])];
      await writeXlsxFile(rows.map(row=>row.map(value=>({ value, type: String }))), { columns: [24,20,24,30].map(width=>({width})) }).toFile("学生登录账号.xlsx");
    } catch { setError("下载失败，请重试，或先复制下方账号信息。"); } finally { setPending(false); }
  }
  return <section className="credentials-result" aria-label="学生登录账号"><h3>已生成 {items.length} 个学生密码</h3><p>请现在下载并按人分发。刷新页面后不再显示明文密码；遗失后可在“班级与成员”中重置。</p><button type="button" className="primary-button" disabled={pending} onClick={() => void download()}>{pending ? "正在生成…" : "下载学生账号表（Excel）"}</button>{error && <p role="alert">{error}</p>}<div className="credential-table"><table><thead><tr><th>学号 / 登录账号</th><th>姓名</th><th>密码</th></tr></thead><tbody>{items.map(i=><tr key={i.username}><td>{i.username}</td><td>{i.displayName}</td><td><code>{i.password}</code></td></tr>)}</tbody></table></div></section>;
}
