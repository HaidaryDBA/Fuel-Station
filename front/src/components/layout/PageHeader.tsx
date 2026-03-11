import { ChevronRight } from "lucide-react";
import React from "react";

function PageHeader({
  title,
  subtitle,
  image,
  breadcrumb,
}: {
  title: string;
  subtitle: string;
  image: string;
  breadcrumb: string[];
}) {
  return (
    <div className="relative text-text-secondary h-96 w-full overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-background/85 via-background/70 to-background/60 z-10" />
      <img src={image} alt={title} className="w-full h-full object-cover" />
      <div className="absolute z-20 top-20 w-full">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm mb-4 opacity-90">
            {breadcrumb.map((item, index) => (
              <React.Fragment key={index}>
                <span
                  className={
                    index === breadcrumb.length - 1 ? "font-semibold" : ""
                  }
                >
                  {item}
                </span>
                {index < breadcrumb.length - 1 && (
                  <ChevronRight className="w-4 h-4" />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="flex items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-text-primary mb-4 mt-8 ">
                {title}
              </h1>
              <p className="text-xl md:text-2xl text-text-secondary max-w-2xl">
                {subtitle}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PageHeader;
