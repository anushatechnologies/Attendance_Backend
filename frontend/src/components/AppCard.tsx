import { Card, CardContent, type CardContentProps, type CardProps, type SxProps, type Theme } from "@mui/material";

const baseCardSx: SxProps<Theme> = {
  border: "1px solid rgba(15,23,42,0.08)",
  borderRadius: 5,
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(247,249,255,0.82) 100%), radial-gradient(circle at top right, rgba(216,155,43,0.10), transparent 34%)",
  backdropFilter: "blur(10px)",
  boxShadow: "0 22px 60px rgba(17,24,39,0.08)",
  position: "relative",
  overflow: "hidden",
};

export default function AppCard(
  props: CardProps & { children: React.ReactNode; contentProps?: CardContentProps; contentSx?: SxProps<Theme> },
) {
  const { children, sx, contentProps, contentSx, ...rest } = props;
  const mergedSx = Array.isArray(sx) ? [baseCardSx, ...sx] : [baseCardSx, sx];

  return (
    <Card elevation={0} {...rest} sx={mergedSx}>
      <CardContent
        {...contentProps}
        sx={[
          { p: 3, "&:last-child": { pb: 3 } },
          ...(Array.isArray(contentSx) ? contentSx : [contentSx]),
        ]}
      >
        {children}
      </CardContent>
    </Card>
  );
}
