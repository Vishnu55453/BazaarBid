export default function Loader({ className = '' }) {
  return (
    <div className={`flex items-center justify-center w-full h-40 ${className}`}>
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600"></div>
    </div>
  )
}
