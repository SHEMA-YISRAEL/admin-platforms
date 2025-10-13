import SideBar from "@/components/shared/SideBar";

export default function TopoquizzLayout({ children }: Readonly<{ children: React.ReactNode; }>) {


  return (
    <div>
      <div>
        <SideBar />
      </div>

      {children}
    </div>
  );
}