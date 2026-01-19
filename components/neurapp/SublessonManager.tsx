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
    <div className="border-l-2 border-green-300 pl-4">
      <h4 className="text-sm font-semibold text-gray-700 mb-3">
        Sublecciones {sublessons.length > 0 && `(${sublessons.length})`}
      </h4>

      {sublessons.length === 0 ? (
        <p className="text-xs text-gray-500 py-2">No hay sublecciones creadas para esta lección</p>
      ) : (
        <div className="overflow-auto rounded-lg bg-white shadow-sm border border-gray-200">
          <table className="min-w-full bg-white text-xs 2xl:text-sm">
            <thead className="bg-gradient-to-r from-green-500 to-green-600 text-white sticky top-0">
              <tr>
                <th className="px-3 py-2 text-left uppercase tracking-tight font-semibold">#</th>
                <th className="px-3 py-2 text-left uppercase tracking-tight font-semibold">Sublecciones</th>
              </tr>
            </thead>
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
                  <td className="px-3 py-2 text-gray-700">
                    <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                      {sublesson.order}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-gray-700 font-medium max-w-xs">
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
