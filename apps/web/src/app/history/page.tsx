'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/components/AppLayout';
import { Card, Badge, SkeletonCard, EmptyState, Button } from '@/components/ui/index';
import { api } from '@/lib/api';

const LEVEL_BADGE: Record<string,any> = { very_high:'green', high:'blue', medium:'yellow', low:'red', very_low:'red' };
const LEVEL_LABEL: Record<string,string> = { very_high:'Excelente', high:'Alto', medium:'Médio', low:'Baixo', very_low:'Muito Baixo' };
const TYPE_ICON: Record<string,string> = { email:'✉', username:'@', phone:'☎', cpf:'#' };

export default function HistoryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [history, setHistory] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<string|null>(null);

  useEffect(() => { if (!loading && !user) router.replace('/login'); }, [user, loading, router]);

  const loadHistory = async (p = 1) => {
    setLoadingData(true);
    try {
      const res = await api.history.list(p, 10);
      setHistory(res.history || []);
      setPagination(res.pagination);
      setPage(p);
    } catch (e) { console.error(e); }
    finally { setLoadingData(false); }
  };

  useEffect(() => { if (user) loadHistory(1); }, [user]);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await api.history.delete(id);
      setHistory(h => h.filter(i => i.id !== id));
    } catch {}
    setDeleting(null);
  };

  if (loading || !user) return null;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-4">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Histórico de Consultas</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {pagination?.total || 0} consulta{pagination?.total !== 1 ? 's' : ''} realizadas
            </p>
          </div>
          <Link href="/verify" className="w-full sm:w-auto">
            <Button size="md" className="w-full sm:w-auto justify-center">+ Nova Consulta</Button>
          </Link>
        </div>

        {loadingData ? (
          <div className="space-y-3">{[1,2,3].map(i => <SkeletonCard key={i} />)}</div>
        ) : history.length === 0 ? (
          <Card>
            <EmptyState icon="◷" title="Nenhuma consulta no histórico"
              description="Suas verificações realizadas aparecerão aqui."
              action={<Link href="/verify"><Button>Fazer primeira consulta</Button></Link>} />
          </Card>
        ) : (
          <>
            <div className="space-y-2">
              {history.map(item => (
                <Card key={item.id}>
                  <div className="flex items-start sm:items-center gap-3">
                    {/* Ícone do tipo */}
                    <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm text-blue-500">{TYPE_ICON[item.query_type] || '🔍'}</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start sm:items-center gap-1.5 flex-wrap mb-0.5">
                        <span className="text-sm font-semibold text-gray-800 truncate max-w-[180px] sm:max-w-xs">
                          {item.query_value}
                        </span>
                        <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 font-mono flex-shrink-0">
                          {item.query_type}
                        </span>
                        {item.result_level && (
                          <Badge variant={LEVEL_BADGE[item.result_level] || 'gray'}>
                            {LEVEL_LABEL[item.result_level] || item.result_level}
                          </Badge>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400 font-mono">
                        {new Date(item.created_at).toLocaleString('pt-BR')}
                        {item.result_score != null && (
                          <> · Score: <strong className="text-gray-600">{Math.round(item.result_score)}</strong></>
                        )}
                      </p>
                    </div>

                    {/* Actions — empilhadas no mobile */}
                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 flex-shrink-0">
                      {item.report_id && (
                        <Link href={`/report/${item.report_id}`}>
                          <Button variant="ghost" size="sm" className="text-xs whitespace-nowrap">
                            Ver resultado
                          </Button>
                        </Link>
                      )}
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deleting === item.id}
                        className="text-xs text-gray-300 hover:text-red-400 transition-colors px-1.5 py-1 rounded"
                      >
                        {deleting === item.id ? '...' : '✕'}
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Paginação */}
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-1">
                <Button variant="ghost" size="sm" onClick={() => loadHistory(page-1)} disabled={!pagination.has_prev}>
                  ← Anterior
                </Button>
                <span className="text-xs text-gray-500 font-mono px-2">{page} / {pagination.pages}</span>
                <Button variant="ghost" size="sm" onClick={() => loadHistory(page+1)} disabled={!pagination.has_next}>
                  Próxima →
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
