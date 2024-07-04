export const validate = (schema) => async (req, res, next) => {
    try {
      const parsedBody = await schema.parseAsync(req.body);
      req.body = parsedBody;
      next();
    } catch (err) {
      const status = 422;
      const message = "Validation failed";
      const extraDetails = err.errors[0].message;
  
      const error = {
        status,
        message,
        extraDetails,
      };
  
      console.error(error);
  
      // Send error response back to client
      res.status(status).json({
        status,
        message,
        extraDetails,
      });
    }
  };
  
