import AuthLeftPanel from './AuthLeftPanel';

export default function AuthShell({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-[#F4F1EA]">
      <div className="w-full max-w-5xl wood-pattern-bg rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[660px] md:h-[660px] border border-[#6E473B]/10 transition-all duration-300">
        <AuthLeftPanel />
        <div className="w-full md:w-[60%] bg-[#F9F8F6] p-5 sm:p-7 md:p-8 flex flex-col justify-between relative text-[#23150d] overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
