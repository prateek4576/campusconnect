import os

import cloudinary
import cloudinary.uploader


def initialize_cloudinary():
    """
    Configure Cloudinary using backend environment variables.
    """

    cloud_name = os.environ.get("CLOUDINARY_CLOUD_NAME")
    api_key = os.environ.get("CLOUDINARY_API_KEY")
    api_secret = os.environ.get("CLOUDINARY_API_SECRET")

    if not cloud_name or not api_key or not api_secret:
        raise RuntimeError(
            "Cloudinary credentials are not configured"
        )

    cloudinary.config(
        cloud_name=cloud_name,
        api_key=api_key,
        api_secret=api_secret,
        secure=True,
    )


def upload_image(file_data, filename, folder="campusconnect"):
    """
    Upload an image to Cloudinary.
    """

    initialize_cloudinary()

    result = cloudinary.uploader.upload(
        file_data,
        folder=folder,
        resource_type="image",
        use_filename=True,
        unique_filename=True,
        overwrite=False,
    )

    return {
        "url": result.get("secure_url"),
        "public_id": result.get("public_id"),
        "format": result.get("format"),
        "width": result.get("width"),
        "height": result.get("height"),
        "bytes": result.get("bytes"),
    }