locals {
  src_dir      = abspath("${path.module}/..")
  content_type_map = {
    html        = "text/html",
    txt         = "text/html",
    js          = "application/javascript",
    css         = "text/css",
    svg         = "image/svg+xml",
    jpg         = "image/jpeg",
    ico         = "image/x-icon",
    png         = "image/png",
    gif         = "image/gif",
    pdf         = "application/pdf"
    json        = "application/json"
  }

  cache_type_map = {
    html        = "no-store",
    js          = "no-store",
    css         = "no-store",
    svg         = "",
    jpg         = "",
    ico         = "",
    png         = "",
    gif         = "",
    pdf         = "",
    json        = ""
  }
}

resource "aws_s3_bucket" "bucket" {
    bucket = var.s3_bucket_name    
    tags = {}
    website {
        index_document = "index.html"
    }    
}

resource "aws_s3_bucket_policy" "bucket" {
  bucket = aws_s3_bucket.bucket.id
  
  policy = jsonencode({
        "Version": "2008-10-17",
        "Id": "PolicyForCloudFrontPrivateContent",
        "Statement": [
            {
                "Sid": "AllowCloudFrontServicePrincipal",
                "Effect": "Allow",
                "Principal": {
                    "Service": "cloudfront.amazonaws.com"
                },
                "Action": "s3:GetObject",
                "Resource": "arn:aws:s3:::speakease-frontend-stable/*",
                "Condition": {
                    "StringEquals": {
                      "AWS:SourceArn": "arn:aws:cloudfront::140409968401:distribution/EKJ84O7TGOWRR"
                    }
                }
            }
        ]
      })    
}

resource "aws_s3_bucket_public_access_block" "bucket" {
  bucket = aws_s3_bucket.bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_object" "build" {
    for_each = fileset(local.src_dir, "static/**/*")
    bucket = aws_s3_bucket.bucket.id
    key    = replace(each.value, "static", "")
    source = "${local.src_dir}/${each.value}"
    etag = filemd5("${local.src_dir}/${each.value}")
    cache_control = lookup(local.cache_type_map, try(regex("\\.(?P<extension>[A-Za-z0-9]+)$", each.value).extension, "txt"), "")
    content_type  = lookup(local.content_type_map, try(regex("\\.(?P<extension>[A-Za-z0-9]+)$", each.value).extension, "txt"), "application/octet-stream")
}

