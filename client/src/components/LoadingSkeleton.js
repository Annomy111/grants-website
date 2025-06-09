import React, { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

const LoadingSkeleton = ({ type = 'grant-card', count = 3 }) => {
  const { darkMode } = useContext(ThemeContext);

  const GrantCardSkeleton = () => (
    <div
      className={`rounded-2xl overflow-hidden ${
        darkMode
          ? 'bg-gray-800/50 backdrop-blur border border-gray-700/50'
          : 'bg-white/80 backdrop-blur border border-gray-200/50'
      } animate-pulse`}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-start space-x-4 flex-1">
            {/* Logo skeleton */}
            <div
              className={`flex-shrink-0 w-14 h-14 rounded-xl ${
                darkMode ? 'bg-gray-700' : 'bg-gray-200'
              }`}
            />
            <div className="flex-1">
              {/* Title skeleton */}
              <div
                className={`h-6 ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-200'
                } rounded-md mb-2 w-3/4`}
              />
              {/* Organization skeleton */}
              <div
                className={`h-4 ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-200'
                } rounded-md w-1/2`}
              />
            </div>
          </div>
          {/* Status badge skeleton */}
          <div
            className={`ml-4 w-24 h-6 rounded-full ${
              darkMode ? 'bg-gray-700' : 'bg-gray-200'
            }`}
          />
        </div>

        {/* Pills skeleton */}
        <div className="flex flex-wrap gap-2 mb-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-8 rounded-full ${
                darkMode ? 'bg-gray-700' : 'bg-gray-200'
              }`}
              style={{ width: `${60 + Math.random() * 40}px` }}
            />
          ))}
        </div>

        {/* Description skeletons */}
        <div className="space-y-3 mb-4">
          <div>
            <div
              className={`h-4 ${
                darkMode ? 'bg-gray-700' : 'bg-gray-200'
              } rounded mb-2`}
            />
            <div
              className={`h-4 ${
                darkMode ? 'bg-gray-700' : 'bg-gray-200'
              } rounded w-5/6`}
            />
          </div>
          <div>
            <div
              className={`h-4 ${
                darkMode ? 'bg-gray-700' : 'bg-gray-200'
              } rounded mb-2`}
            />
            <div
              className={`h-4 ${
                darkMode ? 'bg-gray-700' : 'bg-gray-200'
              } rounded w-4/6`}
            />
          </div>
        </div>

        {/* Action buttons skeleton */}
        <div className="flex justify-end items-center gap-3 mt-6">
          <div
            className={`h-10 w-24 rounded-lg ${
              darkMode ? 'bg-gray-700' : 'bg-gray-200'
            }`}
          />
          <div
            className={`h-10 w-28 rounded-xl ${
              darkMode ? 'bg-blue-800' : 'bg-blue-200'
            }`}
          />
        </div>
      </div>
    </div>
  );

  const StatCardSkeleton = () => (
    <div
      className={`relative overflow-hidden rounded-3xl p-8 ${
        darkMode
          ? 'bg-gradient-to-br from-gray-800 to-gray-700'
          : 'bg-gradient-to-br from-white to-gray-50'
      } shadow-xl border ${
        darkMode ? 'border-gray-700' : 'border-gray-200'
      } animate-pulse`}
    >
      <div className="relative z-10">
        <div
          className={`inline-flex p-3 rounded-2xl ${
            darkMode ? 'bg-gray-600' : 'bg-gray-200'
          } mb-4 w-14 h-14`}
        />
        <div
          className={`h-12 ${
            darkMode ? 'bg-gray-600' : 'bg-gray-200'
          } rounded mb-2 w-24`}
        />
        <div
          className={`h-6 ${
            darkMode ? 'bg-gray-600' : 'bg-gray-200'
          } rounded w-32`}
        />
      </div>
    </div>
  );

  const BlogCardSkeleton = () => (
    <div
      className={`rounded-2xl overflow-hidden ${
        darkMode
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white border-gray-200'
      } border shadow-lg animate-pulse`}
    >
      {/* Image skeleton */}
      <div
        className={`h-48 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
      />
      <div className="p-6">
        {/* Title skeleton */}
        <div
          className={`h-6 ${
            darkMode ? 'bg-gray-700' : 'bg-gray-200'
          } rounded mb-3`}
        />
        {/* Excerpt skeleton */}
        <div className="space-y-2 mb-4">
          <div
            className={`h-4 ${
              darkMode ? 'bg-gray-700' : 'bg-gray-200'
            } rounded`}
          />
          <div
            className={`h-4 ${
              darkMode ? 'bg-gray-700' : 'bg-gray-200'
            } rounded w-5/6`}
          />
        </div>
        {/* Meta skeleton */}
        <div className="flex justify-between items-center">
          <div
            className={`h-4 w-24 ${
              darkMode ? 'bg-gray-700' : 'bg-gray-200'
            } rounded`}
          />
          <div
            className={`h-4 w-20 ${
              darkMode ? 'bg-gray-700' : 'bg-gray-200'
            } rounded`}
          />
        </div>
      </div>
    </div>
  );

  const TableRowSkeleton = () => (
    <tr className="animate-pulse">
      <td className="px-6 py-4">
        <div
          className={`h-5 ${
            darkMode ? 'bg-gray-700' : 'bg-gray-200'
          } rounded w-3/4`}
        />
      </td>
      <td className="px-6 py-4">
        <div
          className={`h-5 ${
            darkMode ? 'bg-gray-700' : 'bg-gray-200'
          } rounded w-1/2`}
        />
      </td>
      <td className="px-6 py-4">
        <div
          className={`h-6 w-24 rounded-full ${
            darkMode ? 'bg-gray-700' : 'bg-gray-200'
          }`}
        />
      </td>
      <td className="px-6 py-4 text-right">
        <div
          className={`h-5 w-12 ${
            darkMode ? 'bg-gray-700' : 'bg-gray-200'
          } rounded ml-auto`}
        />
      </td>
    </tr>
  );

  const DetailPageSkeleton = () => (
    <div className="animate-pulse">
      {/* Back button skeleton */}
      <div
        className={`h-5 w-32 ${
          darkMode ? 'bg-gray-700' : 'bg-gray-200'
        } rounded mb-6`}
      />

      <div
        className={`rounded-lg shadow-lg overflow-hidden border ${
          darkMode ? 'border-gray-700' : 'border-gray-200'
        }`}
      >
        {/* Header skeleton */}
        <div
          className={`px-6 py-4 ${
            darkMode ? 'bg-gray-800' : 'bg-blue-700'
          }`}
        >
          <div className="h-8 bg-white/20 rounded mb-2 w-3/4" />
          <div className="h-6 bg-white/10 rounded w-1/2" />
        </div>

        {/* Content skeleton */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((col) => (
              <div key={col} className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i}>
                    <div
                      className={`h-5 ${
                        darkMode ? 'bg-gray-700' : 'bg-gray-200'
                      } rounded mb-2 w-24`}
                    />
                    <div
                      className={`h-4 ${
                        darkMode ? 'bg-gray-600' : 'bg-gray-300'
                      } rounded w-full`}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Apply button skeleton */}
          <div className="mt-8 text-center">
            <div
              className={`h-12 w-32 ${
                darkMode ? 'bg-blue-800' : 'bg-blue-200'
              } rounded-lg mx-auto`}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderSkeletons = () => {
    switch (type) {
      case 'grant-card':
        return Array.from({ length: count }).map((_, i) => (
          <GrantCardSkeleton key={i} />
        ));
      case 'stat-card':
        return Array.from({ length: count }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ));
      case 'blog-card':
        return Array.from({ length: count }).map((_, i) => (
          <BlogCardSkeleton key={i} />
        ));
      case 'table-row':
        return Array.from({ length: count }).map((_, i) => (
          <TableRowSkeleton key={i} />
        ));
      case 'detail-page':
        return <DetailPageSkeleton />;
      default:
        return Array.from({ length: count }).map((_, i) => (
          <GrantCardSkeleton key={i} />
        ));
    }
  };

  if (type === 'table-row') {
    return <>{renderSkeletons()}</>;
  }

  if (type === 'detail-page') {
    return renderSkeletons();
  }

  return (
    <div
      className={
        type === 'stat-card'
          ? 'grid grid-cols-1 md:grid-cols-3 gap-8'
          : type === 'blog-card'
          ? 'grid grid-cols-1 md:grid-cols-3 gap-8'
          : 'space-y-4'
      }
    >
      {renderSkeletons()}
    </div>
  );
};

export default LoadingSkeleton;