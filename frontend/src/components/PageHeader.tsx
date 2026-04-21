import { Box, Typography } from "@mui/material";

export default function PageHeader(props: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  eyebrow?: string;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 2,
        flexWrap: "wrap",
      }}
    >
      <Box>
        {props.eyebrow ? (
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              px: 1.5,
              py: 0.75,
              borderRadius: 999,
              border: "1px solid rgba(15,23,42,0.08)",
              background: "rgba(255,255,255,0.75)",
              fontSize: 12,
              fontWeight: 900,
              color: "text.secondary",
              mb: 1.5,
            }}
          >
            <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "warning.main" }} />
            {props.eyebrow}
          </Box>
        ) : null}
        <Typography variant="h5" sx={{ fontWeight: 950, letterSpacing: -0.2 }}>
          {props.title}
        </Typography>
        {props.subtitle ? (
          <Typography sx={{ opacity: 0.72, mt: 0.5, maxWidth: 720 }}>{props.subtitle}</Typography>
        ) : null}
      </Box>
      {props.right ? <Box sx={{ flexShrink: 0 }}>{props.right}</Box> : null}
    </Box>
  );
}
