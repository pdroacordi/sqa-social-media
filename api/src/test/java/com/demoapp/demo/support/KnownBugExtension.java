package com.demoapp.demo.support;

import java.lang.reflect.Method;

import org.junit.jupiter.api.extension.ExtensionContext;
import org.junit.jupiter.api.extension.InvocationInterceptor;
import org.junit.jupiter.api.extension.ReflectiveInvocationContext;
import org.opentest4j.AssertionFailedError;

public class KnownBugExtension implements InvocationInterceptor {

  @Override
  public void interceptTestMethod(
      Invocation<Void> invocation,
      ReflectiveInvocationContext<Method> invocationContext,
      ExtensionContext extensionContext) throws Throwable {

    if (failsAsExpected(invocation)) {
      return;
    }

    throw new AssertionFailedError(String.format(
        "O bug conhecido \"%s\" nao se reproduziu: remova @KnownBug de %s.",
        knownBugOf(invocationContext.getExecutable()),
        invocationContext.getExecutable().getName()));
  }

  private boolean failsAsExpected(Invocation<Void> invocation) {
    try {
      invocation.proceed();
      return false;
    } catch (Throwable expectedFailure) {
      return true;
    }
  }

  private String knownBugOf(Method testMethod) {
    return testMethod.getAnnotation(KnownBug.class).value();
  }

}
