'use client';

import { SublessonData } from "@/app/hooks/neurapp/useSublessons";

interface SublessonManagerProps {
  sublessons: SublessonData[];
  loading: boolean;
  error?: string | null;
  onSublessonSelect?: (sublessonId: number | null) => void;
  selectedSublessonId?: number | null;
}

export default function SublessonManager({
  sublessons,
  loading,
  error,
  onSublessonSelect,
  selectedSublessonId,
}: SublessonManagerProps) {
  if (loading) {
    return <div className="text-center py-2 text-sm text-gray-500">Cargando sublecciones...</div>;
  }

  if (error) {
    return (
      <div className="mt-3 pl-4 border-l-2 border-red-200">
        <div className="bg-red-50 border border-red-200 rounded p-3">
          <p className="text-xs text-red-600">Error al cargar sublecciones: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {sublessons.length === 0 ? (
        <p className="px-6 text-xs text-gray-500 py-2">No hay sublecciones creadas para esta lección</p>
      ) : (
        <div className="overflow-auto rounded-lg bg-white">
          <table className="w-full bg-white text-xs 2xl:text-sm">
            <tbody className="divide-y divide-gray-100">
              {sublessons.map((sublesson) => (
                <tr
                  key={sublesson.id}
                  className={`hover:bg-green-50/50 transition-colors cursor-pointer ${
                    selectedSublessonId === sublesson.id ? 'bg-green-100/70' : ''
                  }`}
                  onClick={() => {
                    onSublessonSelect?.(sublesson.id);
                  }}
                >
                  <td className="pl-5 py-2 text-gray-700">
                    <span className="inline-block bg-green-200/60 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                      {sublesson.order}
                    </span>
                  </td>
                  <td className="py-2 text-gray-700 font-medium max-w-xs">
                    {sublesson.title}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
