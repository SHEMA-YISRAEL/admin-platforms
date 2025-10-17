import NavBarCustom from "@/components/NavBarCustom";

export default function MainLayout({ children }: Readonly<{children: React.ReactNode;}>) {
  return (
        <div>
            <NavBarCustom/>
            {children}
        </div>
  );
}