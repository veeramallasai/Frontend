import 'package:flutter/material.dart';

import '../../../core/theme/app_colors.dart';

class LanguageSelector extends StatelessWidget {
  const LanguageSelector({
    super.key,
    String selected = 'English',
    String? selectedLanguage,
    ValueChanged<String>? onChanged,
    ValueChanged<String>? onSelected,
  })  : selected = selectedLanguage ?? selected,
        onChanged = onChanged ?? onSelected ?? _noop;

  static void _noop(String _) {}

  final String selected;
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    const List<_Language> languages = <_Language>[
      _Language(code: 'English', nativeName: 'English', subtitle: 'Default'),
      _Language(code: 'Telugu', nativeName: 'తెలుగు', subtitle: 'Telugu'),
      _Language(code: 'Hindi', nativeName: 'हिन्दी', subtitle: 'Hindi'),
    ];

    return Column(
      children: languages
          .map(
            (_Language language) => ListTile(
              title: Text(language.nativeName),
              subtitle: Text(language.subtitle),
              trailing: selected == language.code
                  ? const Icon(Icons.check, color: AppColors.primary)
                  : null,
              onTap: () => onChanged(language.code),
            ),
          )
          .toList(),
    );
  }
}

class _Language {
  const _Language({
    required this.code,
    required this.nativeName,
    required this.subtitle,
  });

  final String code;
  final String nativeName;
  final String subtitle;
}
