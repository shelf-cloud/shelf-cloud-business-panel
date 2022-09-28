import React from 'react'
import { Card, CardBody, Col, Container, Input, Label, Row, Button, Form, FormFeedback, Alert } from 'reactstrap';

type Props = {}

const SignIn = (props: Props) => {
  return (
    <div>
      <div className="auth-page-content">
        <Container>
          <Row>
            <Col lg={12}>
              <div className="text-center mt-sm-5 mb-4 text-white-50">
                <div>
                  {/* <Link to="/" className="d-inline-block auth-logo">
                    <img src={logoLight} alt="" height="20" />
                  </Link> */}
                </div>
                <p className="mt-3 fs-15 fw-medium">Premium Admin & Dashboard Template</p>
              </div>
            </Col>
          </Row>

          <Row className="justify-content-center">
            <Col md={8} lg={6} xl={5}>
              <Card className="mt-4">
                <CardBody className="p-4">
                  <div className="text-center mt-2">
                    <h5 className="text-primary">Welcome Back !</h5>
                    <p className="text-muted">Sign in to continue to Velzon.</p>
                  </div>
                  {/* {error && error ? (<Alert color="danger"> {error} </Alert>) : null} */}
                  <div className="p-2 mt-4">
                    <Form
                      onSubmit={(e) => {
                        e.preventDefault();
                        // validation.handleSubmit();
                        return false;
                      }}
                      action="#">

                      <div className="mb-3">
                        <Label htmlFor="email" className="form-label">Email</Label>
                        <Input
                          name="email"
                          className="form-control"
                          placeholder="Enter email"
                          type="email"
                          // onChange={validation.handleChange}
                          // onBlur={validation.handleBlur}
                          // value={validation.values.email || ""}
                          // invalid={
                          //   validation.touched.email && validation.errors.email ? true : false
                          // }
                        />
                        {/* {validation.touched.email && validation.errors.email ? (
                          <FormFeedback type="invalid">{validation.errors.email}</FormFeedback>
                        ) : null} */}
                      </div>

                      <div className="mb-3">
                        <div className="float-end">
                          {/* <Link to="/forgot-password" className="text-muted">Forgot password?</Link> */}
                        </div>
                        <Label className="form-label" htmlFor="password-input">Password</Label>
                        <div className="position-relative auth-pass-inputgroup mb-3">
                          <Input
                            name="password"
                            // value={validation.values.password || ""}
                            type="password"
                            className="form-control pe-5"
                            placeholder="Enter Password"
                            // onChange={validation.handleChange}
                            // onBlur={validation.handleBlur}
                            // invalid={
                            //   validation.touched.password && validation.errors.password ? true : false
                            // }
                          />
                          {/* {validation.touched.password && validation.errors.password ? (
                            <FormFeedback type="invalid">{validation.errors.password}</FormFeedback>
                          ) : null} */}
                          <button className="btn btn-link position-absolute end-0 top-0 text-decoration-none text-muted" type="button" id="password-addon"><i className="ri-eye-fill align-middle"></i></button>
                        </div>
                      </div>

                      <div className="form-check">
                        <Input className="form-check-input" type="checkbox" value="" id="auth-remember-check" />
                        <Label className="form-check-label" htmlFor="auth-remember-check">Remember me</Label>
                      </div>

                      <div className="mt-4">
                        <Button color="success" className="btn btn-success w-100" type="submit">Sign In</Button>
                      </div>

                      <div className="mt-4 text-center">
                        <div className="signin-other-title">
                          <h5 className="fs-13 mb-4 title">Sign In with</h5>
                        </div>
                      </div>
                    </Form>
                  </div>
                </CardBody>
              </Card>

              <div className="mt-4 text-center">
                {/* <p className="mb-0">Don't have an account ? <Link to="/register" className="fw-semibold text-primary text-decoration-underline"> Signup </Link> </p> */}
              </div>

            </Col>
          </Row>
        </Container>
      </div>
    </div>
  )
}

export default SignIn