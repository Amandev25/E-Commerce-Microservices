// The green "brand" side panel shared by the login and register pages.
export default function AuthBrandPanel({ heading, text }) {
  return (
    <div className="bg-accent text-white p-10 md:p-12 relative overflow-hidden flex flex-col justify-between min-h-[440px] md:min-h-[600px]">
      {/* Decorative circles */}
      <div className="absolute -right-20 -top-16 w-[280px] h-[280px] rounded-full bg-white/[.05]" />
      <div className="absolute right-10 -bottom-24 w-[220px] h-[220px] rounded-full bg-white/[.05]" />

      <div className="relative">
        <div className="font-display font-extrabold text-2xl tracking-tight">MARLOWE</div>
        <div className="text-[13px] text-[#9FE3BC] mt-1.5">Everyday things, thoughtfully made</div>
      </div>

      <div className="relative">
        <h2 className="font-display font-extrabold text-[34px] tracking-tight leading-tight mb-3.5">{heading}</h2>
        <p className="text-[15.5px] leading-relaxed text-[#CDE9D8] max-w-[340px]">{text}</p>
        <div className="flex gap-6 mt-8">
          <div>
            <div className="font-display font-bold text-[22px]">4.8★</div>
            <div className="text-[12.5px] text-[#9FE3BC]">12k+ reviews</div>
          </div>
          <div>
            <div className="font-display font-bold text-[22px]">Secure</div>
            <div className="text-[12.5px] text-[#9FE3BC]">Razorpay &amp; SSL</div>
          </div>
        </div>
      </div>

      <div className="relative text-[12.5px] text-[#8FCDA6]">Demo / portfolio project · not a real store</div>
    </div>
  );
}
