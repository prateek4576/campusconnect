export default function ItemSkeleton() {
  return (
    <article className="bg-white border-2 border-black brutal-shadow flex flex-col animate-pulse">
      
      {/* IMAGE SKELETON */}
      <div className="border-b-2 border-black bg-gray-200 aspect-[4/3]" />

      {/* CONTENT SKELETON */}
      <div className="p-3 flex-1 flex flex-col">

        {/* BADGES */}
        <div className="flex items-center justify-between gap-1 mb-2">
          <div className="h-5 w-12 bg-gray-300 border-2 border-black" />

          <div className="h-5 w-20 bg-gray-300 border border-black" />
        </div>

        {/* TITLE */}
        <div className="h-5 w-3/4 bg-gray-300 mb-2" />

        {/* DESCRIPTION */}
        <div className="space-y-2">
          <div className="h-3 w-full bg-gray-200" />
          <div className="h-3 w-2/3 bg-gray-200" />
        </div>

        {/* LOCATION + DATE */}
        <div className="mt-3 space-y-2">
          <div className="h-3 w-4/5 bg-gray-200" />
          <div className="h-3 w-1/2 bg-gray-200" />
        </div>

        {/* DETAILS */}
        <div className="mt-auto pt-3">
          <div className="h-3 w-2/3 mx-auto bg-gray-300" />
        </div>

      </div>
    </article>
  );
}