import logoImg from '../assets/logo3.png';

export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      <img 
        src={logoImg} 
        alt="Cozygo Logo" 
        className="h-11 w-auto object-contain" 
        onError={(e) => {
          e.target.style.display = 'none';
        }}
      />
    </div>
  );
}