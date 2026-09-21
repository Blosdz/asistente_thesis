import { useRef } from 'react';
import { Loader2 } from 'lucide-react';
import Modal from '../../ui/modal';
import ReferenceForm from './ReferenceForm';

export default function ReferenceFormModal({
  open,
  reference,
  onSave,
  onCancel,
  onPreview,
  onResolveDoi,
  saving,
  documentEditable = false,
  onDirtyChange,
}) {
  const formRef = useRef(null);

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={reference?.id ? 'Editar referencia' : 'Nueva referencia'}
      subtitle="Título y autor son obligatorios. Los datos ausentes se marcarán para revisión."
      modalWidth="lg"
      contentClassName="bg-slate-50 px-5 py-5 sm:px-7 sm:py-6"
      secondaryAction={{ label: 'Descartar cambios', onClick: onCancel, disabled: saving }}
      primaryAction={{
        label: saving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Guardando…
          </>
        ) : documentEditable ? 'Guardar y actualizar Word' : 'Guardar en biblioteca',
        onClick: () => formRef.current?.requestSubmit(),
        disabled: saving,
      }}
    >
      <ReferenceForm
        ref={formRef}
        reference={reference}
        onSave={onSave}
        onPreview={onPreview}
        onResolveDoi={onResolveDoi}
        saving={saving}
        onDirtyChange={onDirtyChange}
      />
    </Modal>
  );
}
