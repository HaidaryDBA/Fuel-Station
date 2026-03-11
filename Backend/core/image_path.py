from .utils import upload_image_path


def settings_image_upload_path(instance, filename):
    return upload_image_path(
        instance=instance,
        filename=filename,
        folder_name='settings',
        instance_field_name='setting_key'
    )
