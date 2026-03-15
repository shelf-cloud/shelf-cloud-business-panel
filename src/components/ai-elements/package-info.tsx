"use client";

import { Badge } from "@shadcn/ui/badge";
import { cn } from "@/lib/shadcn/utils";
import { ArrowRightIcon, MinusIcon, PackageIcon, PlusIcon } from "lucide-react";
import type { HTMLAttributes } from "react";
import { createContext, useContext, useMemo } from "react";

type ChangeType = "major" | "minor" | "patch" | "added" | "removed";

interface PackageInfoContextType {
  name: string;
  currentVersion?: string;
  newVersion?: string;
  changeType?: ChangeType;
}

const PackageInfoContext = createContext<PackageInfoContextType>({
  name: "",
});

export type PackageInfoHeaderProps = HTMLAttributes<HTMLDivElement>;

export const PackageInfoHeader = ({
  className,
  children,
  ...props
}: PackageInfoHeaderProps) => (
  <div
    className={cn("tw:flex tw:items-center tw:justify-between tw:gap-2", className)}
    {...props}
  >
    {children}
  </div>
);

export type PackageInfoNameProps = HTMLAttributes<HTMLDivElement>;

export const PackageInfoName = ({
  className,
  children,
  ...props
}: PackageInfoNameProps) => {
  const { name } = useContext(PackageInfoContext);

  return (
    <div className={cn("tw:flex tw:items-center tw:gap-2", className)} {...props}>
      <PackageIcon className="tw:size-4 tw:text-muted-foreground" />
      <span className="tw:font-medium tw:font-mono tw:text-sm">{children ?? name}</span>
    </div>
  );
};

const changeTypeStyles: Record<ChangeType, string> = {
  added: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  major: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  minor:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  patch: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  removed: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
};

const changeTypeIcons: Record<ChangeType, React.ReactNode> = {
  added: <PlusIcon className="tw:size-3" />,
  major: <ArrowRightIcon className="tw:size-3" />,
  minor: <ArrowRightIcon className="tw:size-3" />,
  patch: <ArrowRightIcon className="tw:size-3" />,
  removed: <MinusIcon className="tw:size-3" />,
};

export type PackageInfoChangeTypeProps = HTMLAttributes<HTMLDivElement>;

export const PackageInfoChangeType = ({
  className,
  children,
  ...props
}: PackageInfoChangeTypeProps) => {
  const { changeType } = useContext(PackageInfoContext);

  if (!changeType) {
    return null;
  }

  return (
    <Badge
      className={cn(
        "tw:gap-1 tw:text-xs tw:capitalize",
        changeTypeStyles[changeType],
        className
      )}
      variant="secondary"
      {...props}
    >
      {changeTypeIcons[changeType]}
      {children ?? changeType}
    </Badge>
  );
};

export type PackageInfoVersionProps = HTMLAttributes<HTMLDivElement>;

export const PackageInfoVersion = ({
  className,
  children,
  ...props
}: PackageInfoVersionProps) => {
  const { currentVersion, newVersion } = useContext(PackageInfoContext);

  if (!(currentVersion || newVersion)) {
    return null;
  }

  return (
    <div
      className={cn(
        "tw:mt-2 tw:flex tw:items-center tw:gap-2 tw:font-mono tw:text-muted-foreground tw:text-sm",
        className
      )}
      {...props}
    >
      {children ?? (
        <>
          {currentVersion && <span>{currentVersion}</span>}
          {currentVersion && newVersion && (
            <ArrowRightIcon className="tw:size-3" />
          )}
          {newVersion && (
            <span className="tw:font-medium tw:text-foreground">{newVersion}</span>
          )}
        </>
      )}
    </div>
  );
};

export type PackageInfoProps = HTMLAttributes<HTMLDivElement> & {
  name: string;
  currentVersion?: string;
  newVersion?: string;
  changeType?: ChangeType;
};

export const PackageInfo = ({
  name,
  currentVersion,
  newVersion,
  changeType,
  className,
  children,
  ...props
}: PackageInfoProps) => {
  const contextValue = useMemo(
    () => ({ changeType, currentVersion, name, newVersion }),
    [changeType, currentVersion, name, newVersion]
  );

  return (
    <PackageInfoContext.Provider value={contextValue}>
      <div
        className={cn("tw:rounded-lg tw:border tw:bg-background tw:p-4", className)}
        {...props}
      >
        {children ?? (
          <>
            <PackageInfoHeader>
              <PackageInfoName />
              {changeType && <PackageInfoChangeType />}
            </PackageInfoHeader>
            {(currentVersion || newVersion) && <PackageInfoVersion />}
          </>
        )}
      </div>
    </PackageInfoContext.Provider>
  );
};

export type PackageInfoDescriptionProps = HTMLAttributes<HTMLParagraphElement>;

export const PackageInfoDescription = ({
  className,
  children,
  ...props
}: PackageInfoDescriptionProps) => (
  <p className={cn("tw:mt-2 tw:text-muted-foreground tw:text-sm", className)} {...props}>
    {children}
  </p>
);

export type PackageInfoContentProps = HTMLAttributes<HTMLDivElement>;

export const PackageInfoContent = ({
  className,
  children,
  ...props
}: PackageInfoContentProps) => (
  <div className={cn("tw:mt-3 tw:border-t tw:pt-3", className)} {...props}>
    {children}
  </div>
);

export type PackageInfoDependenciesProps = HTMLAttributes<HTMLDivElement>;

export const PackageInfoDependencies = ({
  className,
  children,
  ...props
}: PackageInfoDependenciesProps) => (
  <div className={cn("tw:space-y-2", className)} {...props}>
    <span className="tw:font-medium tw:text-muted-foreground tw:text-xs tw:uppercase tw:tracking-wide">
      Dependencies
    </span>
    <div className="tw:space-y-1">{children}</div>
  </div>
);

export type PackageInfoDependencyProps = HTMLAttributes<HTMLDivElement> & {
  name: string;
  version?: string;
};

export const PackageInfoDependency = ({
  name,
  version,
  className,
  children,
  ...props
}: PackageInfoDependencyProps) => (
  <div
    className={cn("tw:flex tw:items-center tw:justify-between tw:text-sm", className)}
    {...props}
  >
    {children ?? (
      <>
        <span className="tw:font-mono tw:text-muted-foreground">{name}</span>
        {version && <span className="tw:font-mono tw:text-xs">{version}</span>}
      </>
    )}
  </div>
);
