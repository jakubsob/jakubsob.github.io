preprocess_data <- function(data, scaler = NULL, imputer = NULL) {
  if (!is.null(scaler)) {
    data <- scaler(data)
  }
  if (!is.null(imputer)) {
    data <- imputer(data)
  }
  data
}

preprocess_data(data = my_data, scaler = scaler, imputer = NULL)
