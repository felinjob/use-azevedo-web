export default function Topbar() {
  return (
    <div className="bg-[#002814] text-white py-2 px-4 text-xs font-medium tracking-wide">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[#C5A059]">✨</span>
          <span>Entrega expressa via Motoboy no Rio de Janeiro</span>
        </div>
        <div className="hidden md:block">
          Parcele em até 12x
        </div>
        <div className="flex items-center gap-2">
          <span>WhatsApp Oficial:</span>
          <span className="text-[#C5A059] font-bold">(21) 97859-4358</span>
        </div>
      </div>
    </div>
  )
}
