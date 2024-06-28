variable "region" {
    description = "my region"
    type = string
    default = "us-east-1"
}

variable "s3_bucket_name" {
    description = "s3 bucket name"
    type = string
    default = "speakease-frontend-testnets"
}