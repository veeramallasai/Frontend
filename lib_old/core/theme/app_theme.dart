import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppColors {
  const AppColors._();

  static const Color primaryGreen = Color(0xFF1B5E20);
  static const Color accentGreen = Color(0xFF4CAF50);
  static const Color lightCream = Color(0xFFF1F8E9);
  static const Color lightMint = Color(0xFFE8F5E9);
  static const Color cardWhite = Colors.white;
  static const Color softPink = Color(0xFFFCE4EC);
  static const Color darkText = Color(0xFF212121);
  static const Color errorRed = Color(0xFFE53935);
  static const Color goldAmber = Color(0xFFFFB300);
  static const Color softGrey = Color(0xFF9E9E9E);
  static const Color borderGrey = Color(0xFFE0E9E1);
  static const Color background = Color(0xFFF7FAF7);
}

class AppTheme {
  const AppTheme._();

  static ThemeData get premiumTheme {
    final ColorScheme colorScheme = ColorScheme.fromSeed(
      seedColor: AppColors.primaryGreen,
      brightness: Brightness.light,
    ).copyWith(
      primary: AppColors.primaryGreen,
      onPrimary: Colors.white,
      secondary: AppColors.accentGreen,
      onSecondary: Colors.white,
      surface: Colors.white,
      onSurface: AppColors.darkText,
      error: AppColors.errorRed,
      onError: Colors.white,
    );

    final TextTheme baseTextTheme = GoogleFonts.latoTextTheme();

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      colorScheme: colorScheme,
      scaffoldBackgroundColor: AppColors.background,
      canvasColor: Colors.white,
      cardColor: Colors.white,
      dividerColor: AppColors.borderGrey,
      splashColor: AppColors.primaryGreen.withOpacity(0.08),
      highlightColor: AppColors.primaryGreen.withOpacity(0.04),
      visualDensity: VisualDensity.adaptivePlatformDensity,

      textTheme: baseTextTheme.copyWith(
        displayLarge: GoogleFonts.lexend(
          fontSize: 34,
          fontWeight: FontWeight.w800,
          color: AppColors.darkText,
        ),
        displayMedium: GoogleFonts.lexend(
          fontSize: 30,
          fontWeight: FontWeight.w800,
          color: AppColors.darkText,
        ),
        headlineLarge: GoogleFonts.lexend(
          fontSize: 28,
          fontWeight: FontWeight.w700,
          color: AppColors.darkText,
        ),
        headlineMedium: GoogleFonts.lexend(
          fontSize: 22,
          fontWeight: FontWeight.w700,
          color: AppColors.darkText,
        ),
        headlineSmall: GoogleFonts.lexend(
          fontSize: 20,
          fontWeight: FontWeight.w700,
          color: AppColors.darkText,
        ),
        titleLarge: GoogleFonts.lexend(
          fontSize: 20,
          fontWeight: FontWeight.w700,
          color: AppColors.darkText,
        ),
        titleMedium: GoogleFonts.lexend(
          fontSize: 16,
          fontWeight: FontWeight.w600,
          color: AppColors.darkText,
        ),
        titleSmall: GoogleFonts.lexend(
          fontSize: 14,
          fontWeight: FontWeight.w600,
          color: AppColors.darkText,
        ),
        bodyLarge: GoogleFonts.lato(
          fontSize: 16,
          fontWeight: FontWeight.w400,
          color: AppColors.darkText,
        ),
        bodyMedium: GoogleFonts.lato(
          fontSize: 14,
          fontWeight: FontWeight.w400,
          color: AppColors.darkText,
        ),
        bodySmall: GoogleFonts.lato(
          fontSize: 12,
          fontWeight: FontWeight.w400,
          color: AppColors.softGrey,
        ),
        labelLarge: GoogleFonts.lexend(
          fontSize: 14,
          fontWeight: FontWeight.w700,
          color: Colors.white,
        ),
        labelMedium: GoogleFonts.lato(
          fontSize: 12,
          fontWeight: FontWeight.w700,
          color: AppColors.darkText,
        ),
      ),

      appBarTheme: AppBarTheme(
        backgroundColor: Colors.white,
        foregroundColor: AppColors.darkText,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        scrolledUnderElevation: 1,
        centerTitle: true,
        iconTheme: const IconThemeData(
          color: AppColors.darkText,
        ),
        actionsIconTheme: const IconThemeData(
          color: AppColors.darkText,
        ),
        titleTextStyle: GoogleFonts.lexend(
          color: AppColors.darkText,
          fontSize: 19,
          fontWeight: FontWeight.w700,
        ),
      ),

      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          elevation: 0,
          backgroundColor: AppColors.primaryGreen,
          foregroundColor: Colors.white,
          disabledBackgroundColor:
          AppColors.primaryGreen.withOpacity(0.45),
          disabledForegroundColor: Colors.white70,
          minimumSize: const Size(120, 48),
          padding: const EdgeInsets.symmetric(
            horizontal: 20,
            vertical: 13,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
          textStyle: GoogleFonts.lexend(
            fontSize: 15,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),

      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          elevation: 0,
          foregroundColor: AppColors.primaryGreen,
          minimumSize: const Size(120, 48),
          padding: const EdgeInsets.symmetric(
            horizontal: 20,
            vertical: 13,
          ),
          side: const BorderSide(
            color: AppColors.primaryGreen,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
          textStyle: GoogleFonts.lexend(
            fontSize: 14,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),

      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: AppColors.primaryGreen,
          textStyle: GoogleFonts.lato(
            fontSize: 14,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),

      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: const Color(0xFFF7FAF7),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 17,
        ),
        labelStyle: GoogleFonts.lato(
          color: AppColors.softGrey,
          fontSize: 14,
          fontWeight: FontWeight.w600,
        ),
        hintStyle: GoogleFonts.lato(
          color: AppColors.softGrey,
          fontSize: 14,
        ),
        errorStyle: GoogleFonts.lato(
          color: AppColors.errorRed,
          fontSize: 12,
          fontWeight: FontWeight.w600,
        ),
        prefixIconColor: AppColors.primaryGreen,
        suffixIconColor: AppColors.primaryGreen,
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(
            color: AppColors.borderGrey,
          ),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(
            color: AppColors.primaryGreen,
            width: 1.8,
          ),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(
            color: AppColors.errorRed,
          ),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(
            color: AppColors.errorRed,
            width: 1.6,
          ),
        ),
      ),

      cardTheme: CardThemeData(
        color: Colors.white,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(18),
          side: const BorderSide(
            color: AppColors.borderGrey,
          ),
        ),
      ),

      snackBarTheme: SnackBarThemeData(
        behavior: SnackBarBehavior.floating,
        backgroundColor: AppColors.primaryGreen,
        contentTextStyle: GoogleFonts.lato(
          color: Colors.white,
          fontSize: 14,
          fontWeight: FontWeight.w600,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(14),
        ),
      ),

      drawerTheme: const DrawerThemeData(
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.transparent,
      ),

      bottomSheetTheme: const BottomSheetThemeData(
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.transparent,
        showDragHandle: true,
      ),

      dialogTheme: DialogThemeData(
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.transparent,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(24),
        ),
      ),

      checkboxTheme: CheckboxThemeData(
        fillColor: WidgetStateProperty.resolveWith<Color?>(
              (Set<WidgetState> states) {
            if (states.contains(WidgetState.selected)) {
              return AppColors.primaryGreen;
            }

            return null;
          },
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(5),
        ),
      ),

      progressIndicatorTheme: const ProgressIndicatorThemeData(
        color: AppColors.primaryGreen,
        linearTrackColor: AppColors.lightMint,
        circularTrackColor: AppColors.lightMint,
      ),

      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        backgroundColor: Colors.white,
        selectedItemColor: AppColors.primaryGreen,
        unselectedItemColor: AppColors.softGrey,
        type: BottomNavigationBarType.fixed,
        elevation: 12,
        selectedLabelStyle: GoogleFonts.lato(
          fontSize: 12,
          fontWeight: FontWeight.w700,
        ),
        unselectedLabelStyle: GoogleFonts.lato(
          fontSize: 11,
          fontWeight: FontWeight.w600,
        ),
      ),

      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.transparent,
        indicatorColor: AppColors.lightMint,
        elevation: 8,
        iconTheme: WidgetStateProperty.resolveWith<IconThemeData>(
              (Set<WidgetState> states) {
            return IconThemeData(
              color: states.contains(WidgetState.selected)
                  ? AppColors.primaryGreen
                  : AppColors.softGrey,
            );
          },
        ),
        labelTextStyle: WidgetStateProperty.resolveWith<TextStyle>(
              (Set<WidgetState> states) {
            return GoogleFonts.lato(
              fontSize: 12,
              fontWeight: states.contains(WidgetState.selected)
                  ? FontWeight.w700
                  : FontWeight.w600,
              color: states.contains(WidgetState.selected)
                  ? AppColors.primaryGreen
                  : AppColors.softGrey,
            );
          },
        ),
      ),

      chipTheme: ChipThemeData(
        backgroundColor: Colors.white,
        selectedColor: AppColors.primaryGreen,
        disabledColor: Colors.grey.shade200,
        side: const BorderSide(
          color: AppColors.borderGrey,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        labelStyle: GoogleFonts.lato(
          color: AppColors.darkText,
          fontSize: 12,
          fontWeight: FontWeight.w700,
        ),
        secondaryLabelStyle: GoogleFonts.lato(
          color: Colors.white,
          fontSize: 12,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}