import 'package:flutter_test/flutter_test.dart';

import 'package:farm_to_home_app/core/config/backend_config.dart';

void main() {
  testWidgets('Farm To Home basic test', (WidgetTester tester) async {
    expect(true, isTrue);
  });

  test('backend config resolves a local development URL', () {
    final String localHost = BackendConfig.localDevelopmentBaseUrl;

    expect(localHost, isNotEmpty);
    expect(localHost, startsWith('http'));
    expect(localHost, contains('8082'));
  });

  test('backend config defaults to the deployed host unless local backend is explicitly enabled', () {
    expect(BackendConfig.baseUrl, BackendConfig.defaultDeployedUrl);
  });

  test('backend config strips trailing slashes from custom URLs', () {
    expect(
      BackendConfig.withoutTrailingSlash('https://example.com/'),
      'https://example.com',
    );
  });
}