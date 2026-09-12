import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import Link from 'next/link';

export default async function TodosPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: todos, error } = await supabase.from('todos').select();

  return (
    <div className="min-h-screen bg-background text-foreground p-8 flex flex-col items-center justify-center font-sans">
      <div className="w-full max-w-lg bg-surface border border-border rounded-xl shadow-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h1 className="font-display font-bold text-lg text-foreground">Supabase Todos Test</h1>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-primary/10 text-primary font-semibold">
            {error ? 'TABLE PENDING' : 'CONNECTED'}
          </span>
        </div>

        {error ? (
          <div className="space-y-3">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-900 space-y-1">
              <p className="font-semibold">Table &apos;todos&apos; not found in schema cache</p>
              <p className="text-[11px] font-mono text-muted">
                Status: {error.code || 'PGRST205'} — {error.message}
              </p>
            </div>
            <p className="text-xs text-foreground-secondary leading-relaxed">
              The Supabase client successfully authenticated with your project, but the <code className="font-mono bg-border/50 px-1 py-0.5 rounded">todos</code> table has not been created yet.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {todos && todos.length > 0 ? (
              todos.map((todo) => (
                <li key={todo.id} className="p-2.5 rounded border border-border-subtle bg-[#FAFBF9] text-xs font-mono">
                  {todo.name || todo.title || JSON.stringify(todo)}
                </li>
              ))
            ) : (
              <p className="text-xs text-muted font-mono py-2">No todos recorded in database yet.</p>
            )}
          </ul>
        )}

        <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
          <Link href="/" className="text-primary hover:underline">
            ← Return to RenewableIQ
          </Link>
          <span className="font-mono text-[10px] text-muted">evycxmysydmbjsxyzpzt.supabase.co</span>
        </div>
      </div>
    </div>
  );
}
