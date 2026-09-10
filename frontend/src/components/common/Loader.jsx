const Loader = ({ fullScreen }) => (
  <div
    className={
      fullScreen
        ? 'flex h-screen items-center justify-center'
        : 'flex items-center justify-center py-10'
    }
  >
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
  </div>
);

export default Loader;
