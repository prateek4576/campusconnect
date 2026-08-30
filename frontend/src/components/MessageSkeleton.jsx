export default function MessageSkeleton() {
  return (
    <div className="w-full bg-white border-2 border-black brutal-shadow-sm p-5 animate-pulse">
      <div className="flex items-start justify-between gap-4">

        <div className="flex-1">

          {/* Item title */}
          <div className="h-6 w-28 bg-gray-300 mb-3"></div>

          {/* Conversation title */}
          <div className="h-4 w-56 bg-gray-300 mb-4"></div>

          {/* Message */}
          <div className="h-4 w-3/4 bg-gray-300 mb-2"></div>
          <div className="h-4 w-1/2 bg-gray-300"></div>

        </div>

        {/* Unread count */}
        <div className="w-8 h-8 bg-gray-300"></div>

      </div>
    </div>
  );
}