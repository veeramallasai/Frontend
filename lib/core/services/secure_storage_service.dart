typedef SecureRead = Future<String?> Function(String key);
typedef SecureWrite = Future<void> Function(String key, String value);
typedef SecureDelete = Future<void> Function(String key);
typedef SecureClear = Future<void> Function();

class SecureStorageService {
  SecureStorageService({
    SecureRead? read,
    SecureWrite? write,
    SecureDelete? delete,
    SecureClear? clear,
  })  : _reader = read,
        _writer = write,
        _deleter = delete,
        _clearer = clear;

  final SecureRead? _reader;
  final SecureWrite? _writer;
  final SecureDelete? _deleter;
  final SecureClear? _clearer;
  final Map<String, String> _sessionValues = <String, String>{};

  Future<String?> read(String key) async {
    final String safeKey = _validateKey(key);
    if (_reader != null) return _reader(safeKey);
    return _sessionValues[safeKey];
  }

  Future<void> write(String key, String value) async {
    final String safeKey = _validateKey(key);
    if (_writer != null) {
      await _writer(safeKey, value);
      return;
    }
    _sessionValues[safeKey] = value;
  }

  Future<void> delete(String key) async {
    final String safeKey = _validateKey(key);
    if (_deleter != null) {
      await _deleter(safeKey);
      return;
    }
    _sessionValues.remove(safeKey);
  }

  Future<void> clear() async {
    if (_clearer != null) {
      await _clearer();
      return;
    }
    _sessionValues.clear();
  }

  Future<bool> containsKey(String key) async => await read(key) != null;

  String _validateKey(String value) {
    final String key = value.trim();
    if (key.isEmpty) {
      throw ArgumentError.value(value, 'key', 'Key cannot be empty.');
    }
    return key;
  }
}
