'use client';

import { Button } from "@heroui/react";
import { SublessonData } from "@/app/hooks/neurapp/useSublessons";

interface SublessonInfoPanelProps {
  sublesson: SublessonData;
  onEdit: () => void;
}

export default function SublessonInfoPanel({
  sublesson,
  onEdit
}: SublessonInfoPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold text-gray-800">
          Información de la Sublección
        </h3>
        <Button
          color="primary"
          size="sm"
          onPress={onEdit}
        >
          Editar
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                Título
              </th>
              {sublesson.description && (
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Descripción
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-4 py-3 text-sm text-gray-800 align-top">
                {sublesson.title}
              </td>
              {sublesson.description && (
                <td className="px-4 py-3 text-sm text-gray-800 whitespace-pre-wrap align-top">
                  {sublesson.description}
                </td>
              )}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
