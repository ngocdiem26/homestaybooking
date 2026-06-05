import homeImg from '../assets/nha2.jpg';

export default function AuthLeftPanel() {
  return (
    <div className="w-full md:w-[40%] relative min-h-[250px] md:min-h-auto overflow-hidden flex flex-col justify-end">
      <img 
        src={homeImg} 
        alt="Cozygo Nature Homestay" 
        className="w-full h-full object-cover absolute inset-0 transform scale-100 hover:scale-105 transition-all duration-1000"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#23150d]/90 via-[#23150d]/20 to-transparent"></div>
      
      <div className="absolute bottom-8 left-8 right-8 text-white hidden sm:block">
        <span className="inline-block text-[11px] font-bold uppercase tracking-widest bg-[#2C3E2B] px-3 py-1 rounded-full text-[#F4F1EA] mb-4 shadow-sm">
          <i className="fa-solid fa-tree mr-1.5"></i> Về Với Tự Nhiên
        </span>
        <h2 className="font-classic text-2xl font-medium leading-tight text-[#F4F1EA] drop-shadow-md text-left">
          Chạm tay vào sương sớm, nghe hơi thở đại ngàn.
        </h2>
        <p className="text-[11px] text-white/80 mt-2 font-light text-left">Căn nhà gỗ nguyên căn biệt lập đang chờ đón gia đình bạn cùng chill trọn vẹn.</p>
      </div>
    </div>
  );
}