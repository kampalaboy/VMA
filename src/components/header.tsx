import { MdRefresh } from "react-icons/md";

const Header = () => {
  return (
    <div className="h-16 px-4 py-3 flex justify-between items-center bg-blue-600 w-full z-10">
      <div className="w-1/3"></div>
      <div className="w-1/3 flex justify-center">
        <span className="font-bold">VIMA</span>
      </div>
      <div className="w-1/3 flex justify-end">
        <div
          onClick={() => window.location.reload()}
          className="bg-transparent py-1 px-4 rounded-md hover:cursor-pointer"
        >
          <MdRefresh
            size={23}
            className="transition-transform active:animate-[spin_1s_ease-in-out]"
          />
        </div>
      </div>
    </div>
  );
};

export default Header;
