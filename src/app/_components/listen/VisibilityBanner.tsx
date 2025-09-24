interface VisibilityBannerProps {
  isPublic: boolean;
  isCreator: boolean;
}

export function VisibilityBanner({ isPublic, isCreator }: VisibilityBannerProps) {
  if (isPublic && !isCreator) return null;

  const backgroundColor = isPublic ? "bg-success-100" : "bg-warning-100";
  const textColor = isPublic ? "text-success-800" : "text-warning-800";
  const borderColor = isPublic ? "border-success-200" : "border-warning-200";
  
  return (
    <div className={`w-full p-4 ${backgroundColor} ${textColor} border ${borderColor} rounded-lg mb-4`}>
      {isPublic ? (
        <p className="text-sm font-medium">
          This audio file is public and can be accessed by anyone with the link.
        </p>
      ) : (
        <p className="text-sm font-medium">
          This audio file is private and can only be accessed by you.
        </p>
      )}
    </div>
  );
}