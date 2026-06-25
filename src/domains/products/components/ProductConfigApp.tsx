import { useState } from 'react';
import { Settings, Workflow, ListChecks, FileText, ArrowLeft, History } from 'lucide-react';
import type { LoanProduct, LeadFormSchema, BranchOption } from '../types';
import { getFormSchema } from '../client';
import SettingsTab from './SettingsTab';
import LoanStepsTab from './LoanStepsTab';
import ApplicationFormTab from './ApplicationFormTab';
import DocumentsTab from './DocumentsTab';
import VersionHistoryModal from './VersionHistoryModal';

interface Props {
  initialProduct: LoanProduct;
  initialSchema: LeadFormSchema | null;
  branchOptions: BranchOption[];
  canManage: boolean;
}

type TabKey = 'settings' | 'steps' | 'form' | 'documents';

const TABS: { key: TabKey; label: string; icon: typeof Settings }[] = [
  { key: 'steps', label: 'Loan Steps', icon: Workflow },
  { key: 'form', label: 'Application Form', icon: ListChecks },
  { key: 'documents', label: 'Documents', icon: FileText },
  { key: 'settings', label: 'Settings', icon: Settings },
];

export default function ProductConfigApp({
  initialProduct,
  initialSchema,
  branchOptions,
  canManage,
}: Props) {
  const [tab, setTab] = useState<TabKey>('steps');
  const [product, setProduct] = useState(initialProduct);
  const [schema, setSchema] = useState(initialSchema);
  const [showHistory, setShowHistory] = useState(false);

  const isEditable = canManage && (schema === null || schema.status === 'draft');

  async function refreshSchema(schemaId: string) {
    const fresh = await getFormSchema(schemaId);
    setSchema(fresh);
  }

  return (
    <div>
      <div className="mb-6">
        <a
          href="/products"
          className="mb-2 flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-700 dark:text-ink-300"
        >
          <ArrowLeft size={14} /> Back to Products
        </a>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-ink-400">
              <a href="/products" className="hover:text-ink-700 dark:hover:text-ink-200">
                Loan Products
              </a>
              {' / '}
              {product.name}
            </p>
            <h1 className="text-2xl font-semibold text-cente-blue-600 dark:text-cente-blue-300">
              {product.name}
            </h1>
            <p className="mt-1 text-sm text-ink-500 dark:text-ink-300">
              {product.code} · {schema ? `v${schema.version}` : 'No form schema yet'}
            </p>
          </div>
          <button
            onClick={() => setShowHistory(true)}
            className="flex items-center gap-2 rounded-pill border border-ink-200 px-4 py-2 text-sm font-medium text-ink-600 hover:bg-ink-50 dark:border-ink-700 dark:text-ink-200 dark:hover:bg-ink-700/40"
          >
            <History size={15} /> Version History
          </button>
        </div>
      </div>

      {showHistory && (
        <VersionHistoryModal productId={product.id} onClose={() => setShowHistory(false)} />
      )}

      <div className="mb-4 flex gap-1 border-b border-ink-100 dark:border-ink-700">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium ${
              tab === key
                ? 'border-cente-blue-600 text-cente-blue-600 dark:text-cente-blue-300'
                : 'border-transparent text-ink-500 hover:text-ink-700 dark:text-ink-300'
            }`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {tab === 'settings' && (
        <SettingsTab
          product={product}
          branchOptions={branchOptions}
          canManage={canManage}
          onSaved={setProduct}
        />
      )}
      {tab === 'steps' && (
        <LoanStepsTab
          product={product}
          schema={schema}
          canManage={canManage}
          isEditable={isEditable}
          onSchemaChange={setSchema}
          onSchemaRefresh={refreshSchema}
        />
      )}
      {tab === 'form' && (
        <ApplicationFormTab
          product={product}
          schema={schema}
          canManage={canManage}
          isEditable={isEditable}
          onSchemaChange={setSchema}
          onSchemaRefresh={refreshSchema}
        />
      )}
      {tab === 'documents' && (
        <DocumentsTab
          product={product}
          schema={schema}
          canManage={canManage}
          isEditable={isEditable}
          onSchemaChange={setSchema}
          onSchemaRefresh={refreshSchema}
        />
      )}
    </div>
  );
}
