import { ReferralCardSkeleton } from "@/components/ui/skeleton";

export default function FeedLoading() {
  return (
    <div className="mx-auto max-w-md px-4 pb-28 pt-5">
      <div className="mb-4">
        <div className="text-sm font-semibold text-brand">ReferTrust</div>
        <h1 className="text-xl font-bold text-slate-900">For You</h1>
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <ReferralCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
