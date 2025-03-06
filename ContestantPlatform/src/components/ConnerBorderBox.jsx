const CornerBorderBox = ({
  children,
  backgroundColor = "rgba(0,0,0,0.80)",
}) => {
  return (
    <div
      className={`w-full h-auto relative shadow-md mt-3 p-3 flex flex-wrap justify-center max-w-7xl`}
      style={{ flex: 1, backgroundColor }}
    >
      <div className="border-solid border-secondary border absolute right-[3px] left-[3px] bottom-[3px] top-[3px]">
        <div className="absolute top-0 left-0 w-4 h-4 bg-[#d1cbb1] [clip-path:polygon(0_0,100%_0,0_100%)]"></div>
        <div className="absolute top-0 right-0 w-4 h-4 bg-[#d1cbb1] [clip-path:polygon(100%_0,100%_100%,0_0)]"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 bg-[#d1cbb1] [clip-path:polygon(0_100%,0_0,100%_100%)]"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#d1cbb1] [clip-path:polygon(100%_100%,100%_0,0_100%)]"></div>
      </div>

      {/* Nội dung */}
      <div className="w-full relative z-10">{children}</div>
    </div>
  );
};

export default CornerBorderBox;
