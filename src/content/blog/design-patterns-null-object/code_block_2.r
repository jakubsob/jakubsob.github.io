Preprocessor <- R6::R6Class("Preprocessor",
  public = list(
    transform = function(data) {
      stop("Not implemented")
    }
  )
)

StandardScaler <- R6::R6Class(
  "StandardScaler",
  inherit = Preprocessor,
  public = list(
    transform = function(data) {
      scale(data)
    }
  )
)

MeanImputer <- R6::R6Class(
  "MeanImputer",
  inherit = Preprocessor,
  public = list(
    transform = function(data) {
      apply(data, 2, function(x) {
        x[is.na(x)] <- mean(x, na.rm = TRUE)
        return(x)
      })
    }
  )
)

NullPreprocessor <- R6::R6Class(
  "NullPreprocessor",
  inherit = Preprocessor,
  public = list(
    transform = function(data) {
      data
    }
  )
)

preprocess_data <- function(data, transform = list(StandardScaler$new(), MeanImputer$new())) {
  purrr::reduce(transform, .init = data, function(data, transformer) {
    transformer$transform(data)
  })
}
