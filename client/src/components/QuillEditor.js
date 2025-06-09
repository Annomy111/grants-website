import React, { Suspense, memo } from 'react';
import { useQuillLoader, FallbackEditor } from '../hooks/useQuillLoader';

// Loading component
const LoadingEditor = ({ darkMode }) => (
  <div
    className={`w-full min-h-[200px] flex items-center justify-center border rounded-md ${
      darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'
    }`}
  >
    <div className="flex items-center space-x-2">
      <div
        className={`animate-spin rounded-full h-5 w-5 border-b-2 ${
          darkMode ? 'border-white' : 'border-gray-900'
        }`}
      ></div>
      <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        Loading rich text editor...
      </span>
    </div>
  </div>
);

// Error Boundary for Quill Editor
class QuillErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('QuillEditor Error:', error, errorInfo);

    // You could also send this to an error reporting service
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <FallbackEditor
          value={this.props.value}
          onChange={this.props.onChange}
          placeholder={this.props.placeholder}
          className={this.props.className}
          darkMode={this.props.darkMode}
        />
      );
    }

    return this.props.children;
  }
}

// Memoized Quill component to prevent unnecessary re-renders
const MemoizedQuill = memo(({ QuillComponent, ...props }) => {
  if (!QuillComponent) return null;

  return <QuillComponent {...props} />;
});

/**
 * Enhanced QuillEditor component with proper error handling and lazy loading
 */
const QuillEditor = ({
  value,
  onChange,
  modules,
  theme = 'snow',
  placeholder = 'Enter your content here...',
  className = '',
  darkMode = false,
  onError,
  ...props
}) => {
  const { isLoading, error, QuillComponent } = useQuillLoader();

  // Default modules if not provided
  const defaultModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image'],
      ['clean'],
    ],
  };

  const editorModules = modules || defaultModules;

  // Show loading state
  if (isLoading) {
    return <LoadingEditor darkMode={darkMode} />;
  }

  // Show fallback if there was an error loading Quill
  if (error || !QuillComponent) {
    return (
      <FallbackEditor
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={className}
        darkMode={darkMode}
      />
    );
  }

  return (
    <QuillErrorBoundary
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      darkMode={darkMode}
      onError={onError}
    >
      <div className={darkMode ? 'quill-dark' : ''}>
        <Suspense fallback={<LoadingEditor darkMode={darkMode} />}>
          <MemoizedQuill
            QuillComponent={QuillComponent}
            theme={theme}
            value={value}
            onChange={onChange}
            modules={editorModules}
            placeholder={placeholder}
            className={className}
            {...props}
          />
        </Suspense>
      </div>
    </QuillErrorBoundary>
  );
};

export default memo(QuillEditor);
