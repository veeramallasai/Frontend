import 'package:flutter/material.dart';

class ThemeSelector extends StatelessWidget {
  const ThemeSelector({
    super.key,
    String selected = 'fresh',
    String? selectedTheme,
    ValueChanged<String>? onChanged,
    ValueChanged<String>? onSelected,
  })  : selected = selectedTheme ?? selected,
        onChanged = onChanged ?? onSelected ?? _noop;

  static void _noop(String _) {}

  final String selected;
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) => Row(
        children: <Widget>[
          Expanded(
            child: _ThemeOption(
              value: 'fresh',
              title: 'Fresh',
              colors: const <Color>[Color(0xFFFFFFFF), Color(0xFFEAF7EF)],
              selected: selected == 'fresh',
              onTap: onChanged,
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: _ThemeOption(
              value: 'emerald',
              title: 'Emerald',
              colors: const <Color>[Color(0xFF073D24), Color(0xFF159253)],
              selected: selected == 'emerald',
              onTap: onChanged,
            ),
          ),
        ],
      );
}

class _ThemeOption extends StatelessWidget {
  const _ThemeOption({
    required this.value,
    required this.title,
    required this.colors,
    required this.selected,
    required this.onTap,
  });

  final String value;
  final String title;
  final List<Color> colors;
  final bool selected;
  final ValueChanged<String> onTap;

  @override
  Widget build(BuildContext context) => InkWell(
        onTap: () => onTap(value),
        child: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            border: Border.all(color: selected ? Colors.green : Colors.grey),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Text(title),
        ),
      );
}
