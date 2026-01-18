import { Skeleton } from "~/ui/primitives/skeleton";
import { Card, CardContent, CardFooter } from "~/ui/primitives/card";

export function CategorySkeleton() {
    return (
        <>
            {Array.from({ length: 4 }).map((_, i) => (
                <div
                    key={`cat-skeleton-${i}`}
                    className="flex flex-col space-y-4 overflow-hidden rounded-2xl border bg-card p-6"
                >
                    <div className="flex flex-col items-center justify-center space-y-4 text-center">
                        <Skeleton className="h-16 w-16 rounded-full" />
                        <div className="space-y-2 flex flex-col items-center">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-4 w-16" />
                        </div>
                    </div>
                </div>
            ))}
        </>
    );
}

export function ProductSkeleton() {
    return (
        <>
            {Array.from({ length: 8 }).map((_, i) => (
                <Card key={`prod-skeleton-${i}`} className="overflow-hidden rounded-lg">
                    <Skeleton className="h-32 sm:h-40 w-full rounded-t-lg" />
                    <CardContent className="p-2 pt-1.5 sm:p-3 sm:pt-2">
                        <div className="space-y-2">
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-3 w-2/3" />
                            <div className="pt-1 flex items-center space-x-2">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-3 w-12" />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="p-2 pt-0 sm:p-3 sm:pt-0">
                        <Skeleton className="h-6 sm:h-7 w-full rounded-md" />
                    </CardFooter>
                </Card>
            ))}
        </>
    );
}

export function PackageSkeleton() {
    return (
        <>
            {Array.from({ length: 3 }).map((_, i) => (
                <Card key={`pkg-skeleton-${i}`} className="flex flex-col h-full overflow-hidden border transition-all duration-300 rounded-xl">
                    <Skeleton className="aspect-video w-full" />
                    <CardContent className="flex flex-col flex-1 p-5">
                        <div className="space-y-3">
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                            <div className="pt-4 flex items-center justify-between">
                                <Skeleton className="h-6 w-24" />
                                <Skeleton className="h-5 w-16" />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="p-5 pt-0 mt-auto">
                        <Skeleton className="h-10 w-full rounded-lg" />
                    </CardFooter>
                </Card>
            ))}
        </>
    );
}

export function SidebarCategorySkeleton() {
    return (
        <div className="space-y-2">
            <Skeleton className="h-9 w-full rounded" />
            {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={`side-cat-skeleton-${i}`} className="h-9 w-full rounded" />
            ))}
        </div>
    );
}

export function CartItemSkeleton() {
    return (
        <div className="flex gap-4 p-3 rounded-xl border bg-card shadow-sm">
            <Skeleton className="h-24 w-24 flex-shrink-0 rounded-lg" />
            <div className="flex flex-1 flex-col justify-between py-1">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/4" />
                </div>
                <div className="flex items-center justify-between">
                    <Skeleton className="h-8 w-24 rounded-lg" />
                    <Skeleton className="h-8 w-16 rounded-lg" />
                </div>
            </div>
        </div>
    );
}
