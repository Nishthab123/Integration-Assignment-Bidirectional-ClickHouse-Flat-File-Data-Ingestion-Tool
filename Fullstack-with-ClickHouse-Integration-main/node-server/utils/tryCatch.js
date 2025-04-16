function tryCatch(func = async () => {}) {
  return async (req, res, next) => {
    try {
      await func(req, res, next);
    } catch (error) {
      console.error("From", req.originalUrl, "Error:", error.message);
      res.status(500).json({
        message: `Failed to process request on url ${req.originalUrl}`,
        error: error.message,
      });
    }
  };
}

module.exports = tryCatch;
