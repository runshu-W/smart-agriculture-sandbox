export default function TeacherLoading() {
  return <main className="teacher-page teacher-loading" aria-busy="true" aria-label="正在载入管理栏目">
    <div className="teacher-loading-heading"><span /><strong /><i /></div>
    <div className="teacher-loading-kpis">{Array.from({ length: 4 }, (_, index) => <span key={index} />)}</div>
    <div className="teacher-loading-panels"><span /><span /></div>
  </main>;
}
