import 'dart:async';

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class BannerSlideData {
  const BannerSlideData({
    required this.title,
    required this.subtitle,
    required this.badge,
    required this.image,
    required this.colors,
    this.onTap,
  });

  final String title;
  final String subtitle;
  final String badge;
  final String image;
  final List<Color> colors;
  final VoidCallback? onTap;
}

class BannerSlider extends StatefulWidget {
  const BannerSlider({
    super.key,
    required this.banners,
  });

  final List<BannerSlideData> banners;

  @override
  State<BannerSlider> createState() => _BannerSliderState();
}

class _BannerSliderState extends State<BannerSlider> {
  late final PageController _controller;
  Timer? _timer;
  int _index = 0;

  @override
  void initState() {
    super.initState();
    _controller = PageController(viewportFraction: 0.94);
    _timer = Timer.periodic(const Duration(seconds: 5), (_) {
      if (!mounted || widget.banners.length < 2) return;
      final int next = (_index + 1) % widget.banners.length;
      _controller.animateToPage(
        next,
        duration: const Duration(milliseconds: 420),
        curve: Curves.easeOutCubic,
      );
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (widget.banners.isEmpty) return const SizedBox.shrink();

    return Column(
      children: <Widget>[
        SizedBox(
          height: 205,
          child: PageView.builder(
            controller: _controller,
            itemCount: widget.banners.length,
            onPageChanged: (int value) => setState(() => _index = value),
            itemBuilder: (BuildContext context, int index) {
              final BannerSlideData banner = widget.banners[index];
              return Padding(
                padding: const EdgeInsets.symmetric(horizontal: 5),
                child: RepaintBoundary(
                  child: Material(
                    color: Colors.transparent,
                    borderRadius: BorderRadius.circular(24),
                    child: InkWell(
                      borderRadius: BorderRadius.circular(24),
                      onTap: banner.onTap,
                      child: Container(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                            colors: banner.colors,
                          ),
                          borderRadius: BorderRadius.circular(24),
                        ),
                        child: Row(
                          children: <Widget>[
                            Expanded(
                              flex: 6,
                              child: Padding(
                                padding: const EdgeInsets.fromLTRB(20, 20, 8, 18),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: <Widget>[
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 9,
                                        vertical: 5,
                                      ),
                                      decoration: BoxDecoration(
                                        color: Colors.white.withValues(alpha: 0.18),
                                        borderRadius: BorderRadius.circular(20),
                                      ),
                                      child: Text(
                                        banner.badge,
                                        style: GoogleFonts.lexend(
                                          color: Colors.white,
                                          fontSize: 8,
                                          fontWeight: FontWeight.w800,
                                        ),
                                      ),
                                    ),
                                    const Spacer(),
                                    Text(
                                      banner.title,
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                      style: GoogleFonts.lexend(
                                        color: Colors.white,
                                        fontSize: 21,
                                        height: 1.05,
                                        fontWeight: FontWeight.w800,
                                      ),
                                    ),
                                    const SizedBox(height: 7),
                                    Text(
                                      banner.subtitle,
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                      style: GoogleFonts.lato(
                                        color: Colors.white70,
                                        fontSize: 11.5,
                                        height: 1.3,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                            Expanded(
                              flex: 4,
                              child: Padding(
                                padding: const EdgeInsets.all(12),
                                child: Image.asset(
                                  banner.image,
                                  fit: BoxFit.contain,
                                  errorBuilder: (_, __, ___) => const Icon(
                                    Icons.eco_rounded,
                                    color: Colors.white54,
                                    size: 70,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              );
            },
          ),
        ),
        const SizedBox(height: 10),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List<Widget>.generate(widget.banners.length, (int index) {
            return AnimatedContainer(
              duration: const Duration(milliseconds: 180),
              width: index == _index ? 18 : 6,
              height: 6,
              margin: const EdgeInsets.symmetric(horizontal: 3),
              decoration: BoxDecoration(
                color: index == _index
                    ? const Color(0xFF1B5E20)
                    : const Color(0xFFD5DDD6),
                borderRadius: BorderRadius.circular(10),
              ),
            );
          }),
        ),
      ],
    );
  }
}
