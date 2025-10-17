'use client';

import { useRouter } from "next/navigation";
import { Tabs, Tab } from "@heroui/react";
import useMaterias from "@/app/hooks/neurapp/useMaterias";

const colors = [
  "bg-[#C65444]",
  "bg-[#7396C8]",
  "bg-[#939D5C]",
  "bg-[#D17B4C]",
  "bg-[#D0A44D]",
];

const NeuroAppPage: React.FC = () => {
  const { materias, loading, error } = useMaterias();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex w-full justify-center items-center p-8">
        <p>Cargando materias...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex w-full justify-center items-center p-8">
        <p className="text-red-500">Error al cargar materias: {error}</p>
      </div>
    );
  }

  if (materias.length === 0) {
    return (
      <div className="flex w-full justify-center items-center p-8">
        <p>No hay materias disponibles</p>
      </div>
    );
  }

  const handleTabChange = (key: React.Key) => {
    router.push(`/neurapp/${key}`);
  };

  return (
    <div className="flex w-full flex-col mt-2">
      <Tabs
        aria-label="Materias"
        className="justify-center"
        variant="bordered"
        classNames={{ tabList: "justify-center bg-black" }}
        onSelectionChange={handleTabChange}
      >
        {materias.map((materia, index) => (
          <Tab
            key={materia.id}
            title={
              <span
                className={`px-2 py-2 text-gray-50 hover:bg-gray-400 hover:text-white font-bold rounded-lg ${
                  colors[index % colors.length]
                }`}
              >
                {materia.title}
              </span>
            }
          />
        ))}
      </Tabs>

      <div className="mt-4">
        <p className="text-center text-gray-500">
          Selecciona una materia para ver su contenido
        </p>
      </div>
    </div>
  );
};

export default NeuroAppPage;
