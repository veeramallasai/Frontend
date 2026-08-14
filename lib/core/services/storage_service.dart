import 'dart:typed_data';

typedef StorageUploader = Future<String> Function(
  String path,
  Uint8List bytes,
  String contentType,
);
typedef StorageDeleter = Future<void> Function(String path);
typedef StorageUrlResolver = Future<String> Function(String path);

class StorageService {
  const StorageService({
    StorageUploader? uploader,
    StorageDeleter? deleter,
    StorageUrlResolver? urlResolver,
  })  : _uploader = uploader,
        _deleter = deleter,
        _urlResolver = urlResolver;

  final StorageUploader? _uploader;
  final StorageDeleter? _deleter;
  final StorageUrlResolver? _urlResolver;

  bool get isConfigured =>
      _uploader != null && _deleter != null && _urlResolver != null;

  Future<String> upload({
    required String path,
    required Uint8List bytes,
    String contentType = 'application/octet-stream',
  }) {
    final StorageUploader? uploadFile = _uploader;
    if (uploadFile == null) {
      throw StateError('Storage uploader has not been configured.');
    }
    if (bytes.isEmpty) {
      throw ArgumentError.value(bytes, 'bytes', 'File cannot be empty.');
    }
    return uploadFile(_validatePath(path), bytes, contentType.trim());
  }

  Future<void> delete(String path) {
    final StorageDeleter? deleteFile = _deleter;
    if (deleteFile == null) {
      throw StateError('Storage deleter has not been configured.');
    }
    return deleteFile(_validatePath(path));
  }

  Future<String> getDownloadUrl(String path) {
    final StorageUrlResolver? resolveUrl = _urlResolver;
    if (resolveUrl == null) {
      throw StateError('Storage URL resolver has not been configured.');
    }
    return resolveUrl(_validatePath(path));
  }

  String userAvatarPath(String userId) =>
      'users/${_segment(userId)}/avatar.jpg';

  String productImagePath(String productId, String fileName) =>
      'products/${_segment(productId)}/${_segment(fileName)}';

  String _validatePath(String value) {
    final String path = value.trim().replaceAll('\\', '/');
    if (path.isEmpty || path.startsWith('/') || path.contains('../')) {
      throw ArgumentError.value(value, 'path', 'Invalid storage path.');
    }
    return path;
  }

  String _segment(String value) {
    final String segment = value
        .trim()
        .replaceAll(RegExp(r'[^a-zA-Z0-9._-]+'), '-');
    if (segment.isEmpty) {
      throw ArgumentError.value(value, 'value', 'Value cannot be empty.');
    }
    return segment;
  }
}
