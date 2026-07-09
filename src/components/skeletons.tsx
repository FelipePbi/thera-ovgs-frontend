import { Skeleton } from "@/components/ui/skeleton";
import * as Card from "@/components/ui/card";

export function KpiCardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card.Card key={i}>
          <Card.CardHeader>
            <Skeleton className="h-5 w-32" />
          </Card.CardHeader>
          <Card.CardContent>
            <Skeleton className="h-8 w-16" />
          </Card.CardContent>
        </Card.Card>
      ))}
    </div>
  );
}

export function OrderDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-24 rounded-full" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card.Card>
          <Card.CardHeader>
            <Skeleton className="h-5 w-28" />
          </Card.CardHeader>
          <Card.CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-3/4" />
          </Card.CardContent>
        </Card.Card>
        <Card.Card>
          <Card.CardHeader>
            <Skeleton className="h-5 w-16" />
          </Card.CardHeader>
          <Card.CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </Card.CardContent>
        </Card.Card>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-6 w-40" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-10 w-36" />
          <Skeleton className="h-10 w-44" />
        </div>
      </div>
    </div>
  );
}

export function AuditTimelineSkeleton() {
  return (
    <ol className="relative space-y-6 border-l border-border pl-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <li key={i} className="relative">
          <span className="absolute -left-[1.625rem] top-1.5 h-3 w-3 rounded-full border-2 border-background bg-muted" />
          <div className="space-y-3 rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-28" />
              </div>
              <Skeleton className="h-6 w-28" />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-16 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function FormFieldsSkeleton({ fields = 3 }: { fields?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  );
}

export function PageFiltersSkeleton() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Skeleton className="h-10 w-40" />
      <Skeleton className="h-10 w-44" />
      <Skeleton className="h-10 w-52" />
      <Skeleton className="h-10 w-36" />
      <Skeleton className="h-10 w-36" />
      <Skeleton className="h-10 w-20" />
    </div>
  );
}

export function AuthShellSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-sm space-y-4 rounded-xl border border-slate-700 bg-slate-800 p-6">
        <div className="flex flex-col items-center space-y-2">
          <Skeleton className="h-7 w-40 bg-slate-700" />
          <Skeleton className="h-4 w-48 bg-slate-700" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-20 bg-slate-700" />
          <Skeleton className="h-10 w-full bg-slate-700" />
          <Skeleton className="h-4 w-16 bg-slate-700" />
          <Skeleton className="h-10 w-full bg-slate-700" />
          <Skeleton className="h-10 w-full bg-slate-700" />
        </div>
      </div>
    </div>
  );
}
