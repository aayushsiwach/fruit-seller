import React from "react";
import {
    Grid,
    Container,
    Box,
    Typography,
    TextField,
    Button,
    Alert,
} from "@mui/material";
import { FiMail } from "react-icons/fi";
import { motion } from "framer-motion";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

// Validation schema using Yup
const NewsletterSchema = Yup.object().shape({
    email: Yup.string()
        .email("Please enter a valid email address")
        .required("Email is required"),
});

const Newsletter = () => {
    const [newsletterStatus, setNewsletterStatus] = React.useState<null | "success" | "error">(null);

    const handleNewsletterSubmit = async (
        values: { email: string },
        { setSubmitting, resetForm }: { setSubmitting: (isSubmitting: boolean) => void; resetForm: () => void }
    ) => {
        try {
            // Here you would typically make an API call to subscribe the user
            // For demonstration, we'll simulate a successful submission
            await new Promise((resolve) => setTimeout(resolve, 1000));

            setNewsletterStatus("success");
            resetForm();
        } catch (error) {
            console.error("Error submitting newsletter subscription:", error);
            setNewsletterStatus("error");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Grid>
            <Container >
                <Box
                    sx={{
                        textAlign: "center",
                        bgcolor: "primary.light",
                        borderRadius: 2,
                        p: { xs: 4, md: 6 },
                    }}
                    component={motion.div}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <Typography
                        variant="h4"
                        component="h2"
                        color="white"
                        gutterBottom
                        sx={{ fontWeight: 600 }}
                    >
                        Stay Fresh with Our Newsletter
                    </Typography>
                    <Typography
                        variant="body1"
                        color="white"
                        paragraph
                        sx={{
                            maxWidth: 600,
                            mx: "auto",
                            mb: 4,
                            opacity: 0.9,
                        }}
                    >
                        Subscribe to get exclusive offers, seasonal updates, and
                        fruit-inspired recipes.
                    </Typography>

                    <Formik
                        initialValues={{ email: "" }}
                        validationSchema={NewsletterSchema}
                        onSubmit={handleNewsletterSubmit}
                    >
                        {({ isSubmitting }) => (
                            <Form>
                                <Box
                                    sx={{
                                        display: "flex",
                                        gap: 2,
                                        maxWidth: 500,
                                        mx: "auto",
                                        flexDirection: {
                                            xs: "column",
                                            // sm: "row",
                                        },
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: "100%",
                                            display: "flex",
                                            gap: 2,
                                            maxWidth: 500,
                                            mx: "auto",
                                            flexDirection: {
                                                xs: "column",
                                                sm: "row",
                                            },
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <Field name="email">
                                            {({ field }: import('formik').FieldProps) => (
                                                <TextField
                                                    {...field}
                                                    variant="outlined"
                                                    placeholder="Enter your email"
                                                    fullWidth
                                                    // error={Boolean(errors.email && touched.email)}
                                                    // helperText={touched.email && errors.email}
                                                    sx={{
                                                        bgcolor: "white",
                                                        borderRadius: 1,
                                                        "& .MuiOutlinedInput-root":
                                                            {
                                                                "& fieldset": {
                                                                    border: "none",
                                                                },
                                                            },
                                                    }}
                                                    InputProps={{
                                                        startAdornment: (
                                                            <FiMail
                                                                style={{
                                                                    marginRight: 8,
                                                                    color: "grey",
                                                                }}
                                                            />
                                                        ),
                                                    }}
                                                />
                                            )}
                                        </Field>
                                        <motion.div
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <Button
                                                variant="contained"
                                                color="secondary"
                                                type="submit"
                                                disabled={isSubmitting}
                                                sx={{ px: 4, py: 1.5 }}
                                            >
                                                {isSubmitting
                                                    ? "Submitting..."
                                                    : "Subscribe"}
                                            </Button>
                                        </motion.div>
                                    </Box>

                                    <ErrorMessage name="email">
                                        {(msg) => (
                                            <Typography
                                                variant="body2"
                                                // color="error"
                                                sx={{
                                                    mt: 1,
                                                    color: "white",
                                                    textAlign: "left",
                                                }}
                                            >
                                                {msg}
                                            </Typography>
                                        )}
                                    </ErrorMessage>
                                </Box>
                            </Form>
                        )}
                    </Formik>

                    {newsletterStatus === "success" && (
                        <Alert
                            severity="success"
                            sx={{ mt: 2, maxWidth: 500, mx: "auto" }}
                        >
                            Thank you for subscribing!
                        </Alert>
                    )}
                    {newsletterStatus === "error" && (
                        <Alert
                            severity="error"
                            sx={{ mt: 2, maxWidth: 500, mx: "auto" }}
                        >
                            Failed to subscribe. Please try again.
                        </Alert>
                    )}
                </Box>
            </Container>
        </Grid>
    );
};

export default Newsletter;
